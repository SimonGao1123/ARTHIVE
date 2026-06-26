class ArchivrService
    HISTORY_LIMIT = 10
    MAX_LOOPS = 3

    def self.generate_response(query, media_id, user_id)
        assistant_msg = nil

        ActiveRecord::Base.transaction do
            conversation = ArchivrConversation.find_or_create_by(user_id: user_id, media_id: media_id)
            media = Media.find(media_id)
            user = User.find(user_id)


            # doesn't include current query
            prev_messages = conversation.archivr_messages.order(created_at: :desc).limit(HISTORY_LIMIT).to_a.reverse

            # put previous messages into content for Gemini
            content = prev_messages.map { |m|
                {role: (m.role == "user" ? "user" : "model"), parts: [{text: m.content}]}
            }

            system_instructions = build_system_prompt(user, media) # preserved on every query

            content << {role: "user", parts: [{text: query}]} # slowly build up contents

            user_msg = ArchivrMessage.create!(archivr_conversation: conversation, content: query, role: "user")


            tools = ArchivrTools::SCHEMAS # loads all schemas from ArchivrTools

            counter = 0

            loop do
                if counter >= MAX_LOOPS
                    Rails.logger.error "Max loops reached without final response"
                    raise ActiveRecord::Rollback
                end

                response = GeminiClient.call_gemini_with_tools(system_instructions: system_instructions, contents: content, tools: tools)

                puts "response: #{response[:raw_model_turn]} \n\n\n\n\n\n\n"

                if response[:error]
                    Rails.logger.error "Archivr error: #{response[:error]}"
                    raise ActiveRecord::Rollback
                end


                if !response[:tool_calls].empty?
                    content << response[:raw_model_turn]
                    tool_calls = response[:tool_calls]

                    tool_calls.each do |tool_call|
                        tool_res = ArchivrTools.execute(tool_call[:name], tool_call[:args], {media_id: media_id, user_id: user_id})

                        content << {
                            role: "function",
                            parts: [{
                                functionResponse: {
                                    name: tool_call[:name],
                                    response: {
                                        result: tool_res
                                    }
                                }
                            }]
                        }
                    end

                    counter += 1


                    puts "content: #{content} \n\n\n\n\n\n\n"
                    next
                end

                if response[:text].present?
                    refs = extract_references(response[:text])
                    rating = extract_rating(response[:text])
                    user_msg.update!(prompt_rating: rating)
                    assistant_msg = ArchivrMessage.create!(archivr_conversation: conversation, content: response[:text], role: "assistant", references: refs)
                    break
                else
                    Rails.logger.error "Archivr error: No text in response"
                    raise ActiveRecord::Rollback
                end
            end
        end

        assistant_msg
    end

    def self.build_system_prompt(user, media)
        review = Review.find_by(media_id: media.id, user_id: user.id)
        <<~PROMPT
            You are Archivr — a thoughtful, conversational AI companion for the Arthive media platform. You help users explore, understand, and discuss media, grounded in what real people on Arthive have written.

            === CURRENT MEDIA ===
            #{user.username} is asking about:
            Title: #{media.title}
            Type: #{media.content_type}
            Created by: #{media.creator} (#{media.year})
            Genres: #{media.genre.join(', ')}
            Synopsis: #{media.summary}

            === USER REVIEW ===
            #{review.present? ? review.content : "No review found"}
            Rating: #{review.present? ? review.rating : "No rating found"}
            If finished: #{review.present? ? review.if_finished : "No finished status found"}
            If favorite: #{review.present? ? review.if_favorite : "No favorite status found"}

            === TOOLS AVAILABLE ===
            - For questions about specific reviews, ratings, or what users said about #{media.title}: call `search_reviews_for_current_media`.
            - For "what's similar?" / "recommend me something like this" questions: call `find_similar_media`.
            - For questions about community discussions, debates, or top root threads:
              call `search_similar_root_threads`. Use scope='current_media' for threads about this title;
              scope='related_media' (with optional similarity_hint) for threads about similar titles.
            - For "what lists feature this?" / "what lists are about similar themes?":
              call `search_similar_lists`. Use scope='containing_this_media' for lists with this title;
              scope='containing_related_media' for lists with related titles.
              Pass a similarity_hint to bias toward a specific theme; pass a content_type to restrict to one media type.
            - For factual questions about the media itself (plot, cast, trivia, production, comparisons to other works): you may draw on general knowledge. Be honest if you're uncertain — don't invent details.

            === HOW TO RESPOND ===
            - Speak directly and naturally to #{user.username}, like a friend who knows the media well.
            - For questions about opinions, themes, ratings, or community sentiment: ground your answer in tool results. Cite usernames or thread titles when referencing specific takes ("Karsten gave it 4/5 and called it…").
            - For recommendations of OTHER media: prefer suggestions grounded in tool results (similar media, related lists, related threads). You may suggest from general knowledge if community context is thin, but clearly mark which is which (e.g., "Outside of Arthive, you might also enjoy…").
            - Never fabricate community reviews, user opinions, ratings, threads, or lists that don't appear in tool results.
            - If the question is clearly unrelated to #{media.title} or media in general, gently steer the conversation back.
            - Be concise. Match the user's tone. Avoid bullet points unless listing 3+ items.
            - Use **bold** for titles, names being highlighted, or emphasis. Avoid headings or lists for short responses.
            - For any referenced media, lists, threads, or reviews write it in the format [Media::id], [List::id], [Thread::id], [Review::id]
                - Always include referenced objects to be right after the sentence that references them, after the punctuation.
            - Include a rating of the user's initial prompt between 1 and 10, where 1 is the lowest and 10 is the highest.
                - The rating is based on how well the prompt is related to the media, and if it's appropriate.
                - Any prompt which is very related to the media should be minimum 8 and will be used as a recommended prompt for the user.
            - The rating will be after the final response in the format: {Rating: <rating>}

            Archivr:
        PROMPT
    end

    def self.extract_references(text)
        media_ids = []
        list_ids = []
        thread_ids = []
        review_ids = []

        refs = text.scan(/\[(.*?)\]/).flatten # extracts all text within square brackets

        refs.each do |ref| 
            type = ref.split("::")[0]
            id = ref.split("::")[1]

            case type
            when "Media"
                media_ids << id
            when "List"
                list_ids << id
            when "Thread"
                thread_ids << id
            when "Review"
                review_ids << id
            else
                Rails.logger.error "Unknown reference type: #{type}"
                next
            end
        end

        return {
            media_ids: media_ids,
            list_ids: list_ids,
            thread_ids: thread_ids,
            review_ids: review_ids
        }
    end    

    def self.extract_rating(text)
        rating = text.scan(/\{Rating: (\d+)\}/).flatten.first
        return rating.to_i if rating.present?
        return nil if rating.blank?
    end
end

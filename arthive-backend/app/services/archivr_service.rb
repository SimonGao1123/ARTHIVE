class ArchivrService
    HISTORY_LIMIT = 10
    MAX_LOOPS = 3

    def self.generate_response(query, media_id, user_id)
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

        ArchivrMessage.create!(archivr_conversation: conversation, content: query, role: "user")


        tools = ArchivrTools::SCHEMAS # loads all schemas from ArchivrTools

        counter = 0

        loop do
            break if counter >= MAX_LOOPS
            
            response = GeminiClient.call_gemini_with_tools(system_instructions: system_instructions, contents: content, tools: tools)

            puts "response: #{response[:raw_model_turn]} \n\n\n\n\n\n\n"

            if response[:error]
                Rails.logger.error "Archivr error: #{response[:error]}"
                return nil
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

                puts "content: #{content} \n\n\n\n\n\n\n"

                counter += 1
                next
            end

            if response[:text].present? # just return text early
                return ArchivrMessage.create!(archivr_conversation: conversation, content: response[:text], role: "assistant")
            else
                Rails.logger.error "Archivr error: No text in response"
                return nil
            end

        end

        Rails.logger.error "Max loops reached without final response"
        return nil

    end

    def self.build_system_prompt(user, media)
        <<~PROMPT
            You are Archivr — a thoughtful, conversational AI companion for the Arthive media platform. You help users explore, understand, and discuss media, grounded in what real people on Arthive have written.

            === CURRENT MEDIA ===
            #{user.username} is asking about:
            Title: #{media.title}
            Type: #{media.content_type}
            Created by: #{media.creator} (#{media.year})
            Genres: #{media.genre.join(', ')}
            Synopsis: #{media.summary}

            === HOW TO RESPOND ===
            - Speak directly and naturally to #{user.username}, like a friend who knows the media well.
            - For questions about opinions, themes, ratings, or community sentiment regarding #{media.title}: ground your answer in the reviews and threads above. Cite usernames or thread titles when referencing specific takes ("Karsten gave it 4/5 and called it…").
            - For factual questions about #{media.title} (plot, cast, trivia, production, comparisons to other works): you may draw on general knowledge. Be honest if you're uncertain — don't invent details.
            - For recommendations of OTHER media: prefer suggestions you can ground in the community lists/threads above. You may suggest other media from general knowledge if the community context is thin, but clearly mark which is which (e.g., "Outside of Arthive, you might also enjoy…").
            - Never fabricate community reviews, user opinions, or ratings that aren't in the context above.
            - If the question is clearly unrelated to #{media.title} or media in general, gently steer the conversation back.
            - Be concise. Match the user's tone. Avoid bullet points unless listing 3+ items.
            - Use **bold** for titles, names being highlighted, or emphasis. Avoid headings or lists for short responses.

            Archivr:
        PROMPT
    end

end

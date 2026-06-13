class ArchivrService
    def self.generate_response(query, media_id, user_id)
        conversation = ArchivrConversation.find_or_create_by(user_id: user_id, media_id: media_id)
        media = Media.find(media_id)
        user = User.find(user_id)

        ArchivrMessage.create!(conversation: conversation, content: query, role: "user")

        prev_messages = conversation.archivr_messages.order(:created_at, :desc).limit(10).to_a.reverse
        prev_context = prev_messages.map { |m| "#{m.role == 'user' ? user.username : 'Archivr'}: #{m.content}" }.join("\n")

        embedding = EmbeddingService.embed(query)

        review_results = Review.search(query: query, embedded_query: embedding, search_filter: [], current_user_id: user_id).limit(8)
        media_results = Media.search(query: query, embedded_query: embedding, search_filter: []).limit(5)
        list_results = List.search(query: query, embedded_query: embedding, search_filter: [], current_user_id: user_id).limit(5)
        thread_results = CommunityThread.search(query: query, embedded_query: embedding, search_filter: [], current_user_id: user_id).limit(8)

        review_context = review_results.map { |r|
            rating_str = r.rating ? "#{r.rating}/5" : "no rating"
            "- #{r.user.username} (#{rating_str}): #{r.content}"
        }.join("\n")

        media_context = media_results.map { |m|
            genres = m.genre.join(", ")
            "- #{m.title} (#{m.year}, #{m.content_type}) by #{m.creator} — #{m.summary}"
        }.join("\n")

        list_context = list_results.map { |l|
            "- \"#{l.name}\" by #{l.user.username}: #{l.description}"
        }.join("\n")

        thread_context = thread_results.map { |t|
            "- [#{t.community.media.title}] #{t.title}: #{t.content}"
        }.join("\n")

        media_summary_section = media.reviews_ai_summary.present? ? "\nCommunity Summary:\n#{media.reviews_ai_summary}" : ""
        actors_section = media.actors.present? ? "\nStarring: #{media.actors.join(', ')}" : ""

        prompt = <<~PROMPT
            You are Archivr, a knowledgeable and conversational AI assistant for the Arthive media platform. You help users explore, discuss, and discover media based on real community reviews, threads, and lists.

            You are currently assisting #{user.username} with questions about:
            Title: #{media.title}
            Type: #{media.content_type}
            Created by: #{media.creator} (#{media.year})
            Genres: #{media.genre.join(', ')}#{actors_section}
            Synopsis: #{media.summary}#{media_summary_section}

            --- COMMUNITY CONTEXT ---
            Use the following community data from Arthive to inform your response. Prioritise this over general knowledge when answering questions about opinions, ratings, or recommendations.

            User Reviews for context:
            #{review_context.present? ? review_context : "No relevant reviews found."}

            Related Media:
            #{media_context.present? ? media_context : "No related media found."}

            Community Lists:
            #{list_context.present? ? list_context : "No relevant lists found."}

            Community Threads:
            #{thread_context.present? ? thread_context : "No relevant threads found."}

            --- CONVERSATION HISTORY ---
            #{prev_context.present? ? prev_context : "This is the start of the conversation."}

            --- INSTRUCTIONS ---
            - Answer #{user.username}'s question directly and conversationally.
            - Draw on the community context above when relevant — cite usernames or thread titles when referencing specific opinions.
            - If the question is clearly unrelated to #{media.title} or the Arthive community, politely redirect the conversation back.
            - Do not make up reviews, ratings, or opinions that aren't in the context.
            - Be concise but thorough. Avoid bullet points unless listing multiple items.

            #{user.username}: #{query}
            Archivr:
        PROMPT

        response = ReviewSummaryService.call_gemini(prompt)
        return nil if response.nil?

        ArchivrMessage.create!(conversation: conversation, content: response, role: "assistant")
    end
end

module ArchivrTools
    class SearchSimilarRootThreads
        NAME = "search_similar_root_threads"

        SCHEMA = {
            name: NAME,
            description: <<~DESC,
                Find ROOT community threads (top-level discussions, no replies) on Arthive.
                Use this for questions about community discussions, debates, or what people are talking about.
                Two scopes:
                  - 'current_media' (default): threads in the current media's community.
                  - 'related_media': threads in communities of media semantically similar to the current one
                    (use similarity_hint to bias toward a particular kind of similarity).
                You can semantically search via a query, sort by 'recent' or 'trending', and cap the number returned.
            DESC

            parameters: {
                type: "object",
                properties: {
                    scope: {
                        type: "string",
                        description: "'current_media' (default) or 'related_media'."
                    },
                    query: {
                        type: "string",
                        description: "Optional. Semantic search keywords to filter threads by content."
                    },
                    sort: {
                        type: "string",
                        description: "'recent' (default) or 'trending' (most engaged in the past week)."
                    },
                    similarity_hint: {
                        type: "string",
                        description: "Optional. When scope='related_media', describes what kind of similarity to use when finding related media. If omitted in related mode, uses the current media's own embedding."
                    },
                    threads_limit: {
                        type: "number",
                        description: "Maximum number of threads to return. At most 15, default 5."
                    }
                }
            }
        }.freeze

        # context = {media_id, user_id}, injected by dispatcher
        def self.execute(args, context)
            scope_mode = args["scope"] || "current_media"
            query = args["query"]
            embedding = query.present? ? EmbeddingService.embed(query) : nil

            community_ids =
                if scope_mode == "related_media"
                    current_media = Media.find_by(id: context[:media_id])
                    return { error: "Current media not found" } unless current_media

                    sim_embedding =
                        if args["similarity_hint"].present?
                            EmbeddingService.embed(args["similarity_hint"])
                        else
                            current_media.embedding
                        end
                    return [] if sim_embedding.nil?

                    similar_media_ids = Media
                        .nearest_neighbors(:embedding, sim_embedding, distance: "cosine")
                        .where.not(id: current_media.id)
                        .limit(10)
                        .pluck(:id)
                    Community.where(media_id: similar_media_ids).pluck(:id)
                else
                    community = Community.find_by(media_id: context[:media_id])
                    return [] unless community
                    [community.id]
                end

            return [] if community_ids.empty?

            scope = CommunityThread
                .semantic_search(query, "community_thread", embedding)
                .where(community_id: community_ids)
                .where(parent_thread_id: nil, root_thread_id: nil)
                .where(user_id: User.visible_to(context[:user_id]).select(:id))

            scope = (args["sort"] == "trending" ? scope.sort_by_trending : scope.recent)

            limit = [(args["threads_limit"] || 5).to_i, 15].min
            scope.includes(:user, community: :media).limit(limit).map do |t|
                {
                    title: t.title,
                    content: t.content&.truncate(400),
                    author: t.user.username,
                    media: t.community&.media&.title,
                    likes: t.thread_likes.count,
                    replies: t.child_threads.count,
                    id: t.id
                }
            end
        end
    end
end

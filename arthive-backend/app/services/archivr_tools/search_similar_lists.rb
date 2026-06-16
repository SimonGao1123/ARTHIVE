module ArchivrTools
    class SearchSimilarLists
        NAME = "search_similar_lists"

        SCHEMA = {
            name: NAME,
            description: <<~DESC,
                Find user-curated lists on Arthive.
                Two scopes:
                  - 'containing_this_media' (default): lists that include the current media.
                  - 'containing_related_media': lists that include media semantically related to the current one
                    (similarity_hint can bias the related media search).
                You can:
                  - Pass a similarity_hint to also bias the list ordering by semantic similarity (matches against
                    list embeddings, which are built from name + tags + description).
                  - Filter by content_type ('book' / 'film' / 'series' / 'game').
                  - Cap the number returned.
            DESC

            parameters: {
                type: "object",
                properties: {
                    media_scope: {
                        type: "string",
                        description: "'containing_this_media' (default) or 'containing_related_media'."
                    },
                    user_scope: {
                        type: "string",
                        description: "'current_user' (default) or 'anyone', 'current_user' if user asks about their own lists, 'anyone' if user asks about other users' lists" 
                    },
                    similarity_hint: {
                        type: "string",
                        description: "Optional. Describes a theme or vibe. In 'containing_related_media' mode, determines which media count as related. In either mode, also orders matching lists by semantic similarity against this hint."
                    },
                    content_type: {
                        type: "string",
                        description: "Optional. Restrict to lists tagged with this content type: 'book', 'film', 'series', or 'game'."
                    },
                    lists_limit: {
                        type: "number",
                        description: "Maximum number of lists to return. At most 15, default 5."
                    }
                }
            }
        }.freeze

        # context = {media_id, user_id}, injected by dispatcher
        def self.execute(args, context)
            media_scope_mode = args["media_scope"] || "containing_this_media"
            user_scope_mode = args["user_scope"] || "current_user"
            hint_embedding =
                if args["similarity_hint"].present?
                    EmbeddingService.embed(args["similarity_hint"])
                end

            # Step 1: figure out which media we're looking for lists that contain
            target_media_ids =
                if media_scope_mode == "containing_related_media"
                    current_media = Media.find_by(id: context[:media_id])
                    return { error: "Current media not found" } unless current_media

                    sim_embedding = hint_embedding || current_media.embedding
                    return [] if sim_embedding.nil?

                    Media
                        .nearest_neighbors(:embedding, sim_embedding, distance: "cosine")
                        .where.not(id: current_media.id)
                        .limit(10)
                        .pluck(:id)
                else
                    [context[:media_id]]
                end

            return [] if target_media_ids.empty?

            # Step 2: find list IDs that contain any of those media
            list_ids = MediaInList.where(media_id: target_media_ids).distinct.pluck(:list_id)
            return [] if list_ids.empty?

            # Step 3: visibility + optional content_type filter
            scope = List
                .where(id: list_ids)
            
            if user_scope_mode == "current_user"
                scope = scope.where(user_id: context[:user_id])
            else
                scope = scope.user_visible_filter(context[:user_id])
                .where(user_id: User.visible_to(context[:user_id]).select(:id))
            end
            

            if args["content_type"].present?
                scope = scope.where("? = ANY(content_type)", args["content_type"])
            end

            # Step 4: order — by hint similarity if provided, else most recent
            scope =
                if hint_embedding
                    scope.nearest_neighbors(:embedding, hint_embedding, distance: "cosine")
                else
                    scope.recent
                end

            # Step 5: limit + map
            limit = [(args["lists_limit"] || 5).to_i, 15].min
            scope.includes(:user, media_in_lists: :media).limit(limit).map do |l|
                sample_titles = l.media_in_lists.first(3).map { |mil| mil.media.title }
                {
                    name: l.name,
                    author: l.user.username,
                    description: l.description,
                    tags: l.tags,
                    content_type: l.content_type,
                    sample_media: sample_titles,
                    total_media: l.media_in_lists.size
                }
            end
        end
    end
end

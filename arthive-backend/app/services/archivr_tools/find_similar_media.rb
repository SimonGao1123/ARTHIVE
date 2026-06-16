module ArchivrTools
    class FindSimilarMedia
        NAME = "find_similar_media"

        SCHEMA = {
            name: NAME,
            description: <<~DESC,
                Find other media on Arthive that are semantically similar to the current media.
                Use this for "what's similar to this?", "recommend something like this", or "what else would I enjoy?" questions.
                Use general knowledge of the media and provide a similarity hint to findrelated media on Arthive.
                You can optionally provide a similarity_hint to bias results toward a specific aspect of similarity
                (e.g. "atmospheric and slow-burn", "similar themes of grief"). Without a hint, returns media
                most similar to the current media overall.
                You can also filter results by content_type or by genres.
            DESC

            parameters: {
                type: "object",
                properties: {
                    similarity_hint: {
                        type: "string",
                        description: "Optional. Short phrase describing what kind of similarity you want (e.g. 'similar tone', 'dystopian and bleak'). If omitted, uses the current media's overall similarity."
                    },
                    content_type: {
                        type: "string",
                        description: "Optional. Filter to one media type: 'book', 'film', 'series', or 'game'."
                    },
                    genres: {
                        type: "array",
                        items: { type: "string" },
                        description: "Optional. Filter to media that share at least one of these genres (case-insensitive)."
                    },
                    media_limit: {
                        type: "number",
                        description: "Maximum number of media to return. At most 10, default is 5."
                    }
                }
            }
        }.freeze

        # context = {media_id, user_id}, injected by dispatcher
        def self.execute(args, context)
            current_media = Media.find_by(id: context[:media_id])
            return { error: "Current media not found" } unless current_media

            # Choose the embedding to search around:
            # - similarity_hint provided  -> embed the hint
            # - otherwise                 -> use the current media's own embedding
            embedding = if args["similarity_hint"].present?
                EmbeddingService.embed(args["similarity_hint"])
            else
                current_media.embedding
            end

            return { error: "Could not compute similarity embedding" } if embedding.nil?

            scope = Media
                .nearest_neighbors(:embedding, embedding, distance: "cosine")
                .where.not(id: current_media.id)

            if args["content_type"].present?
                scope = scope.where(content_type: args["content_type"])
            end

            if args["genres"].is_a?(Array) && args["genres"].any?
                normalized = args["genres"].map(&:to_s).map(&:downcase)
                # Postgres array overlap operator: rows whose genre array shares ≥1 element with the given list
                scope = scope.where("LOWER(genre::text)::varchar[] && ARRAY[?]::varchar[]", normalized)
            end

            limit = [(args["media_limit"] || 5).to_i, 10].min
            scope.limit(limit).map do |m|
                {
                    title: m.title,
                    year: m.year,
                    content_type: m.content_type,
                    creator: m.creator,
                    genre: m.genre,
                    summary: m.summary&.truncate(300)
                }
            end
        end
    end
end

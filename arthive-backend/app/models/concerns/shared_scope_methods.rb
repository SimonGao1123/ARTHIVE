REQUIRED_SIMILARITY_THRESHOLD = 0.8
module SharedScopeMethods
    extend ActiveSupport::Concern

    included do
        scope :recent, -> { order(created_at: :desc) }
        scope :page, -> (page_num, limit) {offset((page_num-1)*limit).limit(limit)}

        scope :semantic_search, -> (query, model_type, embedded_query) {
            case model_type
            when "review"
                model = Review
            when "media"
                model = Media
            when "community_thread"
                model = CommunityThread
            when "list"
                model = List
            else
                raise "Invalid model type: #{model_type}"
            end

            # No query → no constraint to add. Return the calling chain unchanged.
            next all if query.blank? || query.length < 3

            embedding = embedded_query.nil? ? EmbeddingService.embed(query) : embedded_query
            next none if embedding.nil?

            vector_literal = "[#{embedding.join(',')}]"
            vector_query = model.nearest_neighbors(:embedding, embedding, distance: "cosine")
                .where("(embedding <=> '#{vector_literal}'::vector) < #{REQUIRED_SIMILARITY_THRESHOLD}")

            vector_query = vector_query.where.not(content: nil) if model_type == "review"

            ids = vector_query.pluck(:id)

            # Use `where(id: ids)` (no `model.` prefix) so Rails merges with the calling chain
            # instead of replacing it. Same reason for `next all` / `next none` above.
            if ids.empty?
                next query_filter(query)
            else
                next where(id: ids)
            end
        }
    end

end

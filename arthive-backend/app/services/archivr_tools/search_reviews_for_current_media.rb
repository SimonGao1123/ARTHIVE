module ArchivrTools
    class SearchReviewsForCurrentMedia
        NAME = "search_reviews_for_current_media"

        SCHEMA = {
            name: NAME,
            description: <<~DESC,

                Search reviews written about the CURRENT media the user is asking about.
                Use this for questions about what other Arthive users thought, said, or rated regarding
                THIS specific media. Can filter by rating range, semantically via a query, 
                or obtain a given number sorted by either the most recent or highest-rated.
            DESC

            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Semantic search keywords, if left nil will just return most recent or highest rated reviews"
                    },
                    min_rating: {
                        type: "number",
                        description: "Only return reviews with rating >= this value (0-5) with increments of 0.5"
                    },
                    max_rating: {
                        type: "number",
                        description: "Only return reviews with rating <= this value (0-5) with increments of 0.5"
                    },
                    reviews_limit: {
                        type: "number",
                        description: "Maximum number of reviews to return, at most 15, default is 10"
                    },
                    sort: {
                        type: "string",
                        description: "Sort order: 'recent' (default) or 'highest_rated'"
                    }
                }
            }
        }.freeze

        # context = {media_id, user_id}, injected by dispatcher

        def self.execute(args, context)
            query = args["query"]
            embedding = query.present? ? EmbeddingService.embed(query) : nil

            scope = Review
                .semantic_search(query, "review", embedding)
                .where(media_id: context[:media_id])
                .where.not(content: [nil, ""])
                .where(user_id: User.visible_to(context[:user_id]).select(:id))
                .includes(:user)

            if args["min_rating"].present?
                scope = scope.where("rating >= ?", args["min_rating"])
            end

            if args["max_rating"].present?
                scope = scope.where("rating <= ?", args["max_rating"])
            end

            if args["sort"] == "highest_rated"
                scope = scope.sort_by_trending
            else
                scope = scope.recent
            end

            scope.limit(args["reviews_limit"] ? [args["reviews_limit"], 15].min : 10).map do |review|
                {
                    user: review.user.username,
                    rating: review.rating,
                    content: review.content
                }
            end
        end
    end
end
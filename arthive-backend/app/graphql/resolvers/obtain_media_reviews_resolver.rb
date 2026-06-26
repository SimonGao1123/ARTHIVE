module Resolvers
    class ObtainMediaReviewsResolver < BaseResolver
        type Types::ReviewType.connection_type, null: false

        argument :media_id, Int, required: true
        argument :query, String, required: false, default_value: null
        argument :sort_by, Types::ReviewsMediaSortEnum, required: false, default_value: "newest"

        def resolve(media_id:, query:, sort_by:)
            media = Media.find_by(id: media_id)
            if media.nil?
                raise GraphQL::ExecutionError, "Media not found"
            end

            reviews = Media.obtain_media_reviews(media_id, query, context[:current_user]&.id, sort_by)

            return reviews
        end
    end
end
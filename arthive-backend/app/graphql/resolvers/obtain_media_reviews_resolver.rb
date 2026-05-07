module Resolvers
    class ObtainMediaReviewsResolver < BaseResolver
        type Types::ReviewType.connection_type, null: false

        argument :media_id, Int, required: true
        argument :query, String, required: false, default_value: null

        def resolve(media_id:, query:)
            validate_user

            media = Media.find_by(id: media_id)
            if media.nil?
                raise GraphQL::ExecutionError, "Media not found"
            end

            reviews = media.reviews.where.not(content: [nil, ""]).includes(:user)
            .in_order_of(:user_id, [context[:current_user].id], filter: false)
            .sort_by_likes
            .query_filter(query)

            return reviews
        end
    end
end
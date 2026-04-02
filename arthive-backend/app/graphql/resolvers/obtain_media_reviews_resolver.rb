module Resolvers
    class ObtainMediaReviewsResolver < BaseResolver
        type [Types::ReviewType], null: false

        argument :media_id, Int, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10

        def resolve(media_id:, page_num:, limit:)
            validate_user

            reviews = Media.media_reviews_page(media_id, page_num, limit)
            return reviews.to_a # convert to array to avoid pagination issues
        end
    end
end
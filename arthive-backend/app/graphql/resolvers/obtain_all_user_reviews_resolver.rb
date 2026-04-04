module Resolvers
    class ObtainAllUserReviewsResolver < BaseResolver
        type [Types::ReviewType], null: false
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :content_type, String, required: false, default_value: "all"
        def resolve(page_num:, limit:, content_type:)
            validate_user

            begin
                reviews = context[:current_user].all_user_reviews(content_type, page_num, limit)
                return reviews # returns a list of reviews
            rescue ActiveRecord::RecordNotFound
                return [] # returns an empty array if user has no reviews
            end
        end
    end
end
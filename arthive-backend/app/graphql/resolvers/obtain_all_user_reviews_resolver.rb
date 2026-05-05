module Resolvers
    class ObtainAllUserReviewsResolver < BaseResolver
        type Types::AllUserReviewsType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :content_type, String, required: false, default_value: "all"
        
        def resolve(user_id:, page_num:, limit:, content_type:)
            validate_user

            if !User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's reviews"
            end

            user = User.find_by(id: user_id)
            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end

            begin
                reviews = user.all_user_reviews(content_type, page_num, limit)
                return { reviews: reviews, user: user } # returns a list of reviews
            rescue ActiveRecord::RecordNotFound
                return { reviews: [], user: user } # returns an empty array if user has no reviews
            end
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
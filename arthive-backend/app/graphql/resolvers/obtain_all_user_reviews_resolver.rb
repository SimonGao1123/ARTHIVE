module Resolvers
    class ObtainAllUserReviewsResolver < BaseResolver
        type Types::AllUserReviewsType, null: false

        argument :user_id, ID, required: true
        argument :content_type, String, required: false, default_value: "all"
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10

        # TODO: add more search filters, so far just search by content
        argument :query, String, required: false, default_value: ""


        def resolve(user_id:, content_type:, page_num:, limit:, query:)
            validate_user

            if !User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's reviews"
            end

            user = User.find_by(id: user_id)
            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end
            if limit < 1 || limit > 100
                raise GraphQL::ExecutionError, "Limit must be between 1 and 100"
            end
            if page_num < 1
                raise GraphQL::ExecutionError, "Page number must be greater than 0"
            end



            reviews = user.content_type_reviews(content_type).recent.semantic_search(query, "review", nil)
            total_count = reviews.count
            total_pages = (total_count.to_f / limit).ceil

            # paginate the reviews
            reviews = reviews.page(page_num, limit)
            return { 
                reviews: reviews, 
                user: user, 
                page_info: {
                    total_pages: total_pages,
                    total_count: total_count
                }
            }
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
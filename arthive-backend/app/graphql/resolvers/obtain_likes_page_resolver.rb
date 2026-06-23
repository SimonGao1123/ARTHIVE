module Resolvers
    class ObtainLikesPageResolver < BaseResolver
        type Types::LikesPageType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :query, String, required: false, default_value: nil
        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"
        argument :type, Types::LikesPageDisplayTypeEnum, required: false, default_value: "media"

        def resolve(user_id:, page_num:, limit:, query:, content_type:, type:)
            validate_user

            if !User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's likes"
            end

            user = User.find_by(id: user_id)
            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end
            
            case type
                when "media"
                    return Media.obtain_media_likes_page(user, content_type, query, page_num, limit)
                when "reviews"
                    return Review.obtain_review_likes_page(user, content_type, query, page_num, limit)
                when "lists"
                    return List.obtain_list_likes_page(user, query, page_num, limit, content_type, context[:current_user].id.to_i)
                else
                    raise GraphQL::ExecutionError, "Invalid type"
            end
        end
    end
end
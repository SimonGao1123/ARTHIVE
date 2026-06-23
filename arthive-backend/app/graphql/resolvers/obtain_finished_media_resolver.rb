module Resolvers
    class ObtainFinishedMediaResolver < BaseResolver
        type Types::ObtainMediaPageType, null: false
        argument :user_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :query, String, required: false, default_value: nil
        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"

        def resolve(user_id:, page_num:, limit:, query:, content_type:)
            validate_user

            if !User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's finished media"
            end

            user = User.find_by(id: user_id)
            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end

            Media.finished_media(user_id, content_type, query, page_num, limit)
            
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
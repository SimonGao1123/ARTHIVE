module Resolvers
    class ObtainFollowerInfoResolver < BaseResolver
        type Types::FollowInfoType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: true
        argument :limit, Int, required: true
        argument :type, Types::FollowTypeEnum, required: true

        def resolve(user_id:, page_num:, limit:, type:)
            validate_user
            
            User.obtain_follower_info(context[:current_user].id, user_id.to_i, page_num, limit, type)
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
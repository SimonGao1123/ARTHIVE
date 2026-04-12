module Resolvers
    class ObtainFollowerInfoResolver < BaseResolver
        type Types::FollowInfoType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: true
        argument :limit, Int, required: true
        argument :type, Types::FollowTypeEnum, required: true

        def resolve(user_id:, page_num:, limit:, type:)
            validate_user
            
            begin
                User.obtain_follower_info(user_id, page_num, limit, type)
            rescue GraphQL::ExecutionError => e
                raise GraphQL::ExecutionError, e.message
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end
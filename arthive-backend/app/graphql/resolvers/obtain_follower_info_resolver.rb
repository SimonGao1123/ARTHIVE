module Resolvers
    class ObtainFollowerInfoResolver < BaseResolver
        type Types::FollowInfoType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: true
        argument :limit, Int, required: true
        argument :type, Types::FollowTypeEnum, required: true
        argument :query, String, required: false, default_value: null

        def resolve(user_id:, page_num:, limit:, type:, query:)
            validate_user
            
            user = User.find_by(id: user_id)
            if user.nil?
                raise GraphQL::ExecutionError, "User not found"
            end

            follows_info = User.obtain_follower_info(context[:current_user].id, user, type, query)
            total_count = follows_info[:follows].count
            total_pages = (total_count.to_f / limit).ceil

            follows = follows_info[:follows].page(page_num, limit)

            return {
                follows: follows,
                user: user,
                count: follows_info[:count],
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
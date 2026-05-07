module Resolvers
    class ObtainAllUserListsResolver < BaseResolver
        type Types::AllUserListsType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :content_type, String, required: false, default_value: "all"
        argument :query, String, required: false, default_value: null
        def resolve(user_id:, page_num:, limit:, content_type:, query:)
            validate_user

            if !User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's lists"
            end

            user = User.find_by(id: user_id)

            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end

            lists = user.content_type_lists(content_type).query_filter(query).recent

            # hide private lists
            if user_id.to_i != context[:current_user].id.to_i
                lists = lists.where(if_private: false)
            end
            total_count = lists.count
            total_pages = (total_count.to_f / limit).ceil

            lists = lists.page(page_num, limit)
            return {
                lists: lists,
                user: user,
                page_info: {
                    total_pages: total_pages,
                    total_count: total_count
                }
            }
        end
    end
end
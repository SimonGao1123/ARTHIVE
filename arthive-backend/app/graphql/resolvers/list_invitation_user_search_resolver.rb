module Resolvers
    class ListInvitationUserSearchResolver < BaseResolver
        description "Search for users to invite to a list, only returns first page of results and requires a query"
        type [Types::UserType], null: false

        argument :query, String, required: true
        argument :list_id, ID, required: true
        argument :limit, Int, required: false, default_value: 10

        def resolve(query:, list_id:, limit:)
            validate_user

            list = List.find_by(id: list_id)
            if list.blank?
                raise GraphQL::ExecutionError, "List not found"
            end

            if !List.editable_by_user(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not allowed to edit this list"
            end
            

            possible_users = User.searchable_list_users(list).query_filter(query)


            return possible_users.limit(limit)
        end
    end
end
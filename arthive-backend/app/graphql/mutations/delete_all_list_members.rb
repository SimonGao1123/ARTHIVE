module Mutations
    class DeleteAllListMembers < BaseMutation
        type Boolean, null: false

        argument :list_id, ID, required: true

        def resolve(list_id:)
            validate_user

            list = List.find_by(id: list_id)

            if list.blank?
                raise GraphQL::ExecutionError, "List not found"
            end

            if list.user_id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of this list"
            end

            list.list_members.destroy_all
            list.normalize_likes_saves_for_list
            return true
        end
    end
end
module Mutations
    class InviteUserToList < BaseMutation
        description "Invite a user to a list"
        type Types::ListMemberType, null: false

        argument :list_id, ID, required: true
        argument :user_id, ID, required: true
        argument :role, Types::ListMemberRoleEnum, required: true

        def resolve(list_id:, user_id:, role:)
            validate_user

            list = List.find_by(id: list_id)
            if list.blank?
                raise GraphQL::ExecutionError, "List not found"
            end

            user = User.find_by(id: user_id)
            if user.blank?
                raise GraphQL::ExecutionError, "User not found"
            end

            if !List.editable_by_user(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not allowed to invite users to this list"
            end

            if context[:current_user].id != list.user_id && role == "admin"
                raise GraphQL::ExecutionError, "You are not allowed to invite admins to this list"
            end

            list_member = ListMember.invite_user_to_list(list, user, role, context[:current_user])

            return list_member
        end
    end
end
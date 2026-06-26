module Mutations
    class AlterListMembership < BaseMutation
        description "As an admin/owner alter existing memberships, define role if action is change_role"

        type Types::ListMemberType, null: false

        argument :list_member_id, ID, required: true
        argument :action, Types::AlterListMembershipActionsEnum, required: true
        argument :role, Types::ListMemberRoleEnum, required: false
        argument :list_id, ID, required: true

        def resolve(list_member_id:, action:, role: nil, list_id:)
            validate_user
            
            list = List.find_by(id: list_id)
            if list.blank?
                raise GraphQL::ExecutionError, "List not found"
            end

            list_member = ListMember.find_by(id: list_member_id)
            if list_member.blank?
                raise GraphQL::ExecutionError, "List member not found"
            end

            if list_member.list_id.to_i != list_id.to_i
                raise GraphQL::ExecutionError, "List member not found"
            end

            if list_member.user_id == context[:current_user].id
                raise GraphQL::ExecutionError, "You cannot alter your own membership"
            end

            # Ensures either admin or owner
            if !List.editable_by_user(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not allowed to edit this list"
            end

            context_role = if list.user_id == context[:current_user].id
                 "owner"
            else
                membership = ListMember.find_by(status: "accepted", user_id: context[:current_user].id, list_id: list_id)
                membership&.role
            
            end

            if context_role.nil?
                raise GraphQL::ExecutionError, "You are not a member of this list"
            end

            # admins can remove members, but admins cannot remove other admins
            if action == "remove"
                if context_role != "owner" && list_member.role == "admin"
                    raise GraphQL::ExecutionError, "You are not allowed to remove an admin"
                end

                list_member.destroy!
                
                list.normalize_likes_saves_for_list
                return list_member
            # only owners can change roles
            elsif action == "change_role" && role.present? && context_role == "owner"

                list_member.update!(role: role)
                return list_member
            end
            raise GraphQL::ExecutionError, "Invalid action"
        end
    end
end
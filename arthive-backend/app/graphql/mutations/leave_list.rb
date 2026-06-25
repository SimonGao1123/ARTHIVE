module Mutations
    class LeaveList < BaseMutation
        type Boolean, null: false

        argument :list_id, ID, required: true

        def resolve(list_id:)
            validate_user
            
            list = List.find_by(id: list_id)
            if list.blank?
                raise GraphQL::ExecutionError, "List not found"
            end

            if !List.if_member_of_list(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not a member of this list"
            end
            
            if list.user_id == context[:current_user].id
                # makes new owner prioritized by admin role and earliest join date
                new_owner = ListMember.where(list_id: list_id, status: "accepted")
                                .order(role: :asc)
                                .order(joined_at: :asc)
                                .first
                
                if new_owner.present?
                    # old owner loses access to list
                    ActiveRecord::Base.transaction do
                        list.update!(user_id: new_owner.user_id)
                        new_owner.destroy! # since owner cannot also be a member
                    end
                else
                    list.destroy!
                    return true
                end
            else
                 ListMember.find_by(list_id: list_id, user_id: context[:current_user].id).destroy!
            end

            ListLike.normalize_for_list(list)

            return true
        end
    end
end
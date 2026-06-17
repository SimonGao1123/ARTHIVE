module Mutations
    class AddOrRemoveMediaInList < BaseMutation
        type Types::ListType, null: false

        argument :list_id, ID, required: true

        argument :if_add, Boolean, required: true
        argument :media_ids, [ID], required: true
        def resolve(list_id:, if_add:, media_ids:)
            validate_user

            list = List.find_by(id: list_id)
            if !list.present?
                raise GraphQL::ExecutionError, "List #{list_id} not found"
            end
            if list.user.id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of list #{list_id}"
            end

            result = List.add_or_remove_media(list_id, media_ids, if_add)
            if result.is_a?(Hash) && result[:error].present?
                raise GraphQL::ExecutionError, result[:error]
            end

            return result
        end
    end
end
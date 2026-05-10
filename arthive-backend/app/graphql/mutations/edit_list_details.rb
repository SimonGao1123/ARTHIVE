module Mutations
    class EditListDetails < BaseMutation
        type Types::ListType, null: false

        argument :list_id, ID, required: true

        argument :name, String, required: false
        argument :if_private, Boolean, required: false
        argument :tags, [String], required: false
        argument :description, String, required: false

        def resolve(**args)
            validate_user

            list = List.find_by(id: args[:list_id])
            if !list.present?
                raise GraphQL::ExecutionError, "List #{args[:list_id]} not found"
            end
            if list.user.id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of list #{args[:list_id]}"
            end

            updates = args.except(:list_id).compact

            if !list.update(updates)
                raise GraphQL::ExecutionError, list.errors.full_messages.join(", ")
            end

            return list
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end

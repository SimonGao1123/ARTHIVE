module Mutations
    class EditListDetails < BaseMutation
        type Types::ListType, null: true

        argument :list_id, ID, required: true

        argument :name, String, required: true
        argument :if_private, Boolean, required: true
        argument :tags, [String], required: false
        argument :description, String, required: false
        argument :delete_list, Boolean, required: true

        def resolve(**args)
            validate_user

            list = List.find_by(id: args[:list_id])
            if !list.present?
                raise GraphQL::ExecutionError, "List #{args[:list_id]} not found"
            end
            if !List.editable_by_user(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not allowed to edit this list"
            end


            if args[:delete_list] && list.user_id == context[:current_user].id
                list.destroy!
                return nil
            end
            if args[:delete_list] && list.user_id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of this list"
            end

            updates = args.except(:list_id, :delete_list)

            if !list.update(updates)
                raise GraphQL::ExecutionError, list.errors.full_messages.join(", ")
            end
            Activity.log(user: context[:current_user], subject: list, status: "updated", snapshot: {
                name: list.name
            })

            return list
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end

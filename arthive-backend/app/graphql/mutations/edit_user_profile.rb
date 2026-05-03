module Mutations
    class EditUserProfile < BaseMutation
        type Types::UserType, null: false

        argument :username, String, required: false
        argument :description, String, required: false
        argument :profile_picture, String, required: false
        argument :visibility, String, required: false
        argument :email, String, required: false
        argument :password, String, required: false

        def resolve(**args)
            validate_user

            current_user = context[:current_user]

            # only keeps the fiels which are NOT NIL
            updates = args.compact

            if current_user.update(updates)
                return current_user
            else
                raise GraphQL::ExecutionError, current_user.errors.full_messages.join(", ")
            end
        end
    end
end
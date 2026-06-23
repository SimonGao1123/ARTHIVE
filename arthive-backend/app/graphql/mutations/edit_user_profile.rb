module Mutations
    class EditUserProfile < BaseMutation
        type Types::UserType, null: false

        argument :username, String, required: true
        argument :description, String, required: false
        argument :visibility, String, required: true
        argument :email, String, required: true
        argument :password, String, required: false

        def resolve(**args)
            validate_user

            if args[:username].blank? || args[:email].blank? || args[:visibility].blank?
                raise GraphQL::ExecutionError, "Username, email, and visibility are required"
            end

            current_user = context[:current_user]

            # ensures that username, visibility and email are present
            # description is option (if removed then will be deleted on DB)
            # password is optional
            updates = args.except(:password)

            was_public = current_user.visibility == "public"

            if current_user.update(updates)
                if args[:password].present?
                    # update password if it was changed
                    current_user.update(password: args[:password])
                end

                if was_public && current_user.visibility != "public"
                    ListLike.normalize_for_owner(current_user.id)
                end

                return current_user
            else
                raise GraphQL::ExecutionError, current_user.errors.full_messages.join(", ")
            end
        end
    end
end
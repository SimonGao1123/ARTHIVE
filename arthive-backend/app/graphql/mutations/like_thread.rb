module Mutations
    class LikeThread < BaseMutation
        description "Like a thread, returns true if like is created, false if like is destroyed"
        type Boolean, null: false

        argument :thread_id, ID, required: true

        def resolve(thread_id:)
            validate_user

            begin
                return ThreadLike.toggle_like(context[:current_user].id, thread_id)
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
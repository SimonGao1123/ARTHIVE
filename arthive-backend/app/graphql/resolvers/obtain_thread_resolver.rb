module Resolvers
    class ObtainThreadResolver < BaseResolver
        type Types::CommunityThreadType, null: false

        argument :thread_id, ID, required: true

        def resolve(thread_id:)
            validate_user

            thread = CommunityThread.includes(:user, :child_threads, :thread_likes).find_by(id: thread_id)
            if thread.blank?
                raise GraphQL::ExecutionError, "Thread not found"
            end

            return thread
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
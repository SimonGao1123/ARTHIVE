module Resolvers
    class ObtainThreadResolver < BaseResolver
        type Types::CommunityThreadType, null: false

        argument :thread_id, ID, required: true

        def resolve(thread_id:)
            thread = CommunityThread.with_attached_images.includes(
                { user: { profile_picture_attachment: :blob } },
                { community: :media },
                :thread_likes
            ).find_by(id: thread_id)
            if thread.blank?
                raise GraphQL::ExecutionError, "Thread not found"
            end

            unless User.if_visible_to_user(context[:current_user]&.id, thread.user_id)
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
module Mutations
    class LikeThread < BaseMutation
        description "Like a thread, returns true if like is created, false if like is destroyed"
        type Boolean, null: false

        argument :thread_id, ID, required: true

        def resolve(thread_id:)
            validate_user

            begin
                existing = ThreadLike.find_by(user_id: context[:current_user].id, community_thread_id: thread_id)
                liked = ThreadLike.toggle_like(context[:current_user].id, thread_id)
                if liked
                    thread_like = ThreadLike.find_by(user_id: context[:current_user].id, community_thread_id: thread_id)
                    Activity.log(user: context[:current_user], subject: thread_like, status: "created")
                    if thread_like.community_thread.user.id != context[:current_user].id
                        SQS_CLIENT.send_message(
                            queue_url: SQS_QUEUE_URL,
                            message_body: {
                                type: "notification",
                                action: "like_on_thread",
                                sender_id: context[:current_user].id,
                                receiver_id: thread_like.community_thread.user.id,
                                parent_thread_id: thread_id
                            }.to_json
                        )
                    end
                else
                    Activity.destroy(user: context[:current_user], subject: existing) if existing
                end
                liked
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
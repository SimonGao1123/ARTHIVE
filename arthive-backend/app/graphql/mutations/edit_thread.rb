module Mutations
    class EditThread < BaseMutation
        type Types::CommunityThreadType, null: true

        argument :thread_id, ID, required: true
        argument :content, String, required: true
        argument :title, String, required: false
        argument :review_id, ID, required: false
        argument :delete_thread, Boolean, required: true

        def resolve(**args)
            validate_user

            thread = CommunityThread.find_by(id: args[:thread_id])
            if !thread.present?
                raise GraphQL::ExecutionError, "Thread #{args[:thread_id]} not found"
            end

            if args[:delete_thread]
                thread.destroy!
                return nil
            end

            if thread.user.id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of thread #{args[:thread_id]}"
            end
            
            if args[:title].present? && (thread.parent_thread.present? || thread.root_thread.present?)
                raise GraphQL::ExecutionError, "Title cannot be present for non-root threads"
            end
            
            if args[:review_id].present?
                if !Review.exists?(id: args[:review_id])
                    raise GraphQL::ExecutionError, "Review #{args[:review_id]} not found"
                end
            end

            updates = args.except(:thread_id, :delete_thread)



            if args[:review_id].present?
                review = Review.find_by(id: args[:review_id])
                # if not quoting yourself, and thread doesn't already have a review, send notification
                if review.user.id != context[:current_user].id && (!thread.review.present? || thread.review.id != review.id)
                    SQS_CLIENT.send_message(
                        queue_url: SQS_QUEUE_URL,
                        message_body: {
                            type: "notification",
                            action: "review_quoted",
                            sender_id: context[:current_user].id,
                            receiver_id: review.user.id,
                            review_id: review.id,
                            parent_thread_id: args[:thread_id]
                        }.to_json
                    )
                end
            end

            if !thread.update(updates)
                raise GraphQL::ExecutionError, thread.errors.full_messages.join(", ")
            end
            
            Activity.log(user: context[:current_user], subject: thread, status: "updated", snapshot: {
                title: thread.title,
                thread_content: thread.content,
                label: "Updated thread"
            })
            return thread

        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue ActiveRecord::RecordInvalid => e
            raise GraphQL::ExecutionError, e.message
        end

    end
end

task sqs_worker: :environment do
    loop do
        response = SQS_CLIENT.receive_message(
            queue_url: SQS_NOTIFICATION_QUEUE_URL,
            max_number_of_messages: 10,
            wait_time_seconds: 20
        )
        response.messages.each do |message|
            payload = JSON.parse(message.body)

            if payload["action"].blank? || payload["sender_id"].blank? || payload["receiver_id"].blank?
                SQS_CLIENT.delete_message(
                    queue_url: SQS_NOTIFICATION_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
                next
            end

            # Process message (handle idempotency, store message id in database)
            begin
                notif = {
                    message_id: message.message_id,
                    receiver_id: payload["receiver_id"],
                    sender_id: payload["sender_id"],
                    action: payload["action"],
                    review_id: payload["review_id"],
                    review_comment_id: payload["review_comment_id"],
                    parent_thread_id: payload["parent_thread_id"],
                    comment_thread_id: payload["comment_thread_id"],
                    follow_id: payload["follow_id"]
                }.compact

                Notification.create!(notif)
                SQS_CLIENT.delete_message(
                    queue_url: SQS_NOTIFICATION_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
            rescue ActiveRecord::RecordNotUnique
                # already processed, just delete
                SQS_CLIENT.delete_message(
                    queue_url: SQS_NOTIFICATION_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
            rescue StandardError => e
                puts "Error creating notification: #{e.message}"
                SQS_CLIENT.delete_message(
                    queue_url: SQS_NOTIFICATION_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
            end
        end
    end
end


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
                next
            end

            # Process message (handle idempotency, store message id in database)
            begin
                if Notification.exists?(message_id: message.message_id)
                    SQS_CLIENT.delete_message(
                        queue_url: SQS_NOTIFICATION_QUEUE_URL,
                        receipt_handle: message.receipt_handle
                    )
                    next
                end

                notif = {
                    message_id: message.message_id,
                    receiver_id: payload["receiver_id"],
                    sender_id: payload["sender_id"],
                    action: payload["action"]
                }
                case payload["action"]
                when *Notification::ACTIONS[:follows]
                    notif[:follow_id] = payload["follow_id"]
                when *Notification::ACTIONS[:reviews]
                    notif[:review_id] = payload["review_id"]
                    if payload["action"] == "comment_on_review"
                        notif[:review_comment_id] = payload["review_comment_id"]
                    end
                when *Notification::ACTIONS[:threads]
                    notif[:parent_thread_id] = payload["parent_thread_id"]
                    if payload["action"] == "comment_on_thread"
                        notif[:comment_thread_id] = payload["comment_thread_id"]
                    end
                when *Notification::ACTIONS[:quote_reviews]
                    notif[:review_id] = payload["review_id"]
                    notif[:parent_thread_id] = payload["parent_thread_id"]
                else
                    puts "Invalid action: #{payload["action"]}"
                    SQS_CLIENT.delete_message(
                        queue_url: SQS_NOTIFICATION_QUEUE_URL,
                        receipt_handle: message.receipt_handle
                    )
                    next
                end

                Notification.create!(notif)
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

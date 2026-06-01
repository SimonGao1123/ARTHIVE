task sqs_worker: :environment do
    loop do
        response = SQS_CLIENT.receive_message(
            queue_url: SQS_QUEUE_URL,
            max_number_of_messages: 10,
            wait_time_seconds: 20
        )
        response.messages.each do |message|
            payload = JSON.parse(message.body)

            if !payload["type"].present?
                SQS_CLIENT.delete_message(
                    queue_url: SQS_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
                next
            end

            case payload["type"]
            when "notification"
                SqsWorker.process_notification(message, payload)
            else
                SQS_CLIENT.delete_message(
                    queue_url: SQS_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
            end
        end
    end
end
class SqsNotificationPoller
  def self.start
    return unless SQS_CLIENT && SQS_NOTIFICATION_QUEUE_URL

    Thread.new do
      Rails.logger.info "[SQS] Notification poller started"
      loop do
        begin
          response = SQS_CLIENT.receive_message(
            queue_url: SQS_NOTIFICATION_QUEUE_URL,
            max_number_of_messages: 10,
            wait_time_seconds: 20
          )

          response.messages.each do |message|
            process(message)
          end
        rescue => e
          Rails.logger.error "[SQS] Polling error: #{e.message}"
          sleep 5
        end
      end
    end
  end

  def self.process(message)
    body = JSON.parse(message.body)

    if body["action"].blank? || body["sender_id"].blank? || body["receiver_id"].blank?
        SQS_CLIENT.delete_message(
            queue_url: SQS_NOTIFICATION_QUEUE_URL,
            receipt_handle: message.receipt_handle
        )
        return
    end

    attrs = {
      message_id:       message.message_id,
      action:           body["action"],
      sender_id:        body["sender_id"],
      receiver_id:      body["receiver_id"],
      review_id:        body["review_id"],
      review_comment_id: body["review_comment_id"],
      parent_thread_id: body["parent_thread_id"],
      comment_thread_id: body["comment_thread_id"],
      follow_id:        body["follow_id"],
    }.compact

    Notification.create!(attrs)

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
    Rails.logger.error "[SQS] Failed to process message #{message.message_id}: #{e.message}"
    SQS_CLIENT.delete_message(
      queue_url: SQS_NOTIFICATION_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue => e
    Rails.logger.error "[SQS] Failed to process message #{message.message_id}: #{e.message}"
  end
end

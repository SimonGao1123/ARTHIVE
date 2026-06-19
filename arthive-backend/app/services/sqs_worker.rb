class SqsWorker
  def self.start
    return unless SQS_CLIENT && SQS_QUEUE_URL

    Thread.new do
      Rails.logger.info "[SQS] SQS poller started"
      loop do
        begin
          response = SQS_CLIENT.receive_message(
            queue_url: SQS_QUEUE_URL,
            max_number_of_messages: 10,
            wait_time_seconds: 20
          )

          response.messages.each do |message|

            payload = JSON.parse(message.body)

            case payload["type"]
            when "notification"
              process_notification(message, payload)
            when "review_summary"
              process_review_summary(message, payload)
            when "embedding"
              process_embedding(message, payload)
            else
                SQS_CLIENT.delete_message(
                    queue_url: SQS_QUEUE_URL,
                    receipt_handle: message.receipt_handle
                )
            end
          end
        rescue => e
          Rails.logger.error "[SQS] Polling error: #{e.message}"
          sleep 5
        end
      end
    end
  end

  def self.process_embedding(message, payload)
    AssignEmbeddingJob.new.perform(payload["target_id"], payload["target_type"])
    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue => e
    # dont delete, let SQS redeliver after visibility timeout
    Rails.logger.error "[SQS] Failed to process embedding #{message.message_id}: #{e.message}"
  end

  
  def self.process_review_summary(message, payload)
    GenerateReviewSummaryJob.new.perform(payload["media_id"]) # synchronous job
    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue ActiveRecord::RecordNotFound
    # Media was deleted between enqueue and processing — drop the message
    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue => e
    Rails.logger.error "[SQS] Failed to process review summary #{message.message_id}: #{e.message}"
    # Do NOT delete — let SQS re-deliver after visibility timeout
  end

  def self.process_notification(message, payload)

    if payload["action"].blank? || payload["sender_id"].blank? || payload["receiver_id"].blank?
        SQS_CLIENT.delete_message(
            queue_url: SQS_QUEUE_URL,
            receipt_handle: message.receipt_handle
        )
        return
    end

    attrs = {
      message_id:       message.message_id,
      action:           payload["action"],
      sender_id:        payload["sender_id"],
      receiver_id:      payload["receiver_id"],
      review_id:        payload["review_id"],
      review_comment_id: payload["review_comment_id"],
      parent_thread_id: payload["parent_thread_id"],
      comment_thread_id: payload["comment_thread_id"],
      follow_id:        payload["follow_id"],
      list_id:          payload["list_id"],
    }.compact

    Notification.create!(attrs)

    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue ActiveRecord::RecordNotUnique
    # already processed, just delete
    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  rescue => e
    Rails.logger.error "[SQS] Failed to process message #{message.message_id}: #{e.message}"
    SQS_CLIENT.delete_message(
      queue_url: SQS_QUEUE_URL,
      receipt_handle: message.receipt_handle
    )
  end
end

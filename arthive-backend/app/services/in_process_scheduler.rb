class InProcessScheduler
  def self.start
    return if Rails.env.test?
    return if SQS_CLIENT.nil?

    scheduler = Rufus::Scheduler.new

    scheduler.cron "0 * * * *" do # every day at midnight
      enqueue_review_summaries
    rescue => e
      Rails.logger.error "[Scheduler] review_summaries tick failed: #{e.message}"
    end

    Rails.logger.info "[Scheduler] in-process scheduler started"
  end

  def self.enqueue_review_summaries
    Media.needing_summary_refresh.pluck(:id).each do |media_id|
      SQS_CLIENT.send_message(
        queue_url: SQS_QUEUE_URL,
        message_body: {
          type: "review_summary",
          media_id: media_id
        }.to_json
      )
    end
  end
end

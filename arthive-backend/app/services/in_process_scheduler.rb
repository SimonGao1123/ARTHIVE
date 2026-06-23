class InProcessScheduler
  def self.start
    return if Rails.env.test?

    scheduler = Rufus::Scheduler.new

    unless SQS_CLIENT.nil?
      scheduler.cron "0 * * * *" do
        enqueue_review_summaries
      rescue => e
        Rails.logger.error "[Scheduler] review_summaries tick failed: #{e.message}"
      end
    end

    scheduler.cron "0 3 * * *" do # daily at 3am
      Activity.cleanup_old_records
    rescue => e
      Rails.logger.error "[Scheduler] activity_cleanup tick failed: #{e.message}"
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

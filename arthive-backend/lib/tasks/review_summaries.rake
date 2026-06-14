namespace :review_summaries do
    task enqueue: :environment do
        next if SQS_CLIENT.nil?
        # finds all media needing a summary refresh and enqueues a job for each
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
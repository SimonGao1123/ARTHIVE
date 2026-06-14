class GenerateReviewSummaryJob < ApplicationJob
    queue_as :default

    def perform(media_id)
        Media.transaction do
            media = Media.lock.find(media_id)
            current_count = media.reviews.where.not(content: [nil, ""]).count

            prev_count = media.last_ai_summary_review_count || 0
            return unless current_count >= prev_count + 10 # double check, in case of race condition

            ai_summary = ReviewSummaryService.summarize_reviews(media: media)
            media.update!(
                reviews_ai_summary: ai_summary,
                last_ai_summary_review_count: current_count
            )
        end
    end
end

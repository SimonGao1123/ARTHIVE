class GenerateReviewSummaryJob < ApplicationJob
    queue_as :default

    def perform(media_id)
        media = Media.find(media_id)
        return unless media

        # only count reviews that HAVE CONTENT
        curr_review_count = media.reviews.where.not(content: [nil, ""]).count
        last_count = media.last_ai_summary_review_count || 0

        if Media::SUMMARY_REVIEW_COUNT_MILESTONES.include?(curr_review_count) && last_count < curr_review_count
            ai_summary = ReviewSummaryService.summarize_reviews(media: media)
            media.update(
                reviews_ai_summary: ai_summary,
                last_ai_summary_review_count: curr_review_count
            )
        end
    end
end

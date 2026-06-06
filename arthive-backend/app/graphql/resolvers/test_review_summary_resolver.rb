module Resolvers
    class TestReviewSummaryResolver < BaseResolver
        type String, null: true

        argument :media_id, ID, required: true
        def resolve(media_id:)
            ReviewSummaryService.summarize_reviews(media_id: media_id)
        end
    end
end
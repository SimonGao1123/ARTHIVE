class GenerateReviewEmbeddingJob < ApplicationJob
    def perform(review_id)
        # this job is called when a review is created or updated, and it generates an embedding for the review
        review = Review.find_by(id: review_id)
        return if review.nil? | review.content.blank? | review.embedding.present?

        embedding = EmbeddingService.embed(review.content + ". Rating: #{review.rating ? review.rating : 'N/A'}.") # embed reviews that have content, alongside their rating
        return if embedding.nil?

        review.update(embedding: embedding)
    end
end
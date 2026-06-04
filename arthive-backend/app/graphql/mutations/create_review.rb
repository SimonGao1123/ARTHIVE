module Mutations
    class CreateReview < BaseMutation
        type Types::CreateReviewType, null: false

        argument :media_id, ID, required: true
        argument :content, String, required: false
        argument :rating, Float, required: false
        argument :if_favorite, Boolean, required: true
        argument :if_finished, Boolean, required: true
        argument :review_id, ID, required: false

        def resolve(media_id:, content:, rating:, if_favorite:, if_finished:, review_id:)
            validate_user

            if media_id.nil? || if_favorite.nil? || if_finished.nil?
                raise GraphQL::ExecutionError, "ERROR IN CREATE REVIEW: ALL ARGUMENTS ARE REQUIRED"
            end
            begin
                existing = review_id.present? ? Review.find_by(id: review_id) : nil

                review_result = Review.update_review(
                    context[:current_user].id,
                    media_id,
                    content,
                    rating,
                    if_favorite,
                    if_finished,
                    review_id
                )
                if review_result[:review]&.persisted? && review_result[:deleted] == false
                    review = review_result[:review]
                    Activity.log(user: context[:current_user], subject: review, status: review_id.nil? ? "created" : "updated", snapshot: {
                        content: review.content,
                        rating: review.rating,
                        if_favorite: review.if_favorite,
                        if_finished: review.if_finished,
                        label: review_activity_label(existing, if_favorite, if_finished, content, rating, review_id.nil?)
                    })
                end

                review_result

            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end

        private

        def review_activity_label(existing, if_favorite, if_finished, content, rating, is_create)
            return "Reviewed" if is_create
            return "Updated review" unless existing

            changes = []
            changes << (if_favorite ? "Favorited" : "Unfavorited") if existing.if_favorite != if_favorite
            changes << (if_finished ? "Marked as watched" : "Removed from watched") if existing.if_finished != if_finished
            changes << "Updated rating" if existing.rating != rating
            changes << "Updated review" if existing.content != content
            changes.any? ? changes.join(" · ") : "Updated review"
        end
    end
end

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
                review_result = Review.update_review(
                    context[:current_user].id,
                    media_id,
                    content,
                    rating,
                    if_favorite,
                    if_finished,
                    review_id
                )
                Activity.log(user: context[:current_user], subject: review_result[:review], status: review_id.nil? ? "created" : "updated") if review_result[:review]&.persisted? && review_result[:deleted] == false
                
                
                review_result

            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end

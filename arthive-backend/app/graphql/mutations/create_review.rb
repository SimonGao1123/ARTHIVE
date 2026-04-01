module Mutations
    class CreateReview < BaseMutation
        type Types::ReviewType, null: false

        argument :media_id, ID, required: true
        argument :content, String, required: false
        argument :rating, Int, required: true
        argument :if_favorite, Boolean, required: true
        argument :if_finished, Boolean, required: true
        argument :review_id, ID, required: false

        def resolve(media_id:, content:, rating:, if_favorite:, if_finished:, review_id:)
            validate_user

            if media_id.nil? || rating.nil? || if_favorite.nil? || if_finished.nil?
                raise GraphQL::ExecutionError, "ERROR IN CREATE REVIEW: ALL ARGUMENTS ARE REQUIRED"
            end
            begin
                Review.update_review(
                    context[:current_user].id,
                    media_id,
                    content,
                    rating,
                    if_favorite,
                    if_finished,
                    review_id
                )
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end

module Mutations
    class CommentOnReview < BaseMutation
        description "Comment on a review, returns the comment"
        type Types::ReviewCommentType, null: false

        argument :review_id, ID, required: true
        argument :comment, String, required: true

        def resolve(review_id:, comment:)
            validate_user

            begin
                review = Review.find_by(id: review_id)
                if review.blank?
                    raise GraphQL::ExecutionError, "Review not found"
                end

                review_comment = ReviewComment.create!(user_id: context[:current_user].id, review_id: review_id, comment: comment)
                Activity.log(user: context[:current_user], subject: review_comment, status: "created")

                if review.user.id != context[:current_user].id
                    SQS_CLIENT.send_message(
                        queue_url: SQS_QUEUE_URL,
                        message_body: {
                            type: "notification",
                            action: "comment_on_review",
                            sender_id: context[:current_user].id,
                            receiver_id: review.user_id,
                            review_id: review.id,
                            review_comment_id: review_comment.id
                        }.to_json
                    )
                end
                review_comment
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
module Mutations
    class CommentOnReview < BaseMutation
        description "Comment on a review, returns the comment"
        type Types::ReviewCommentType, null: false

        argument :review_id, ID, required: true
        argument :comment, String, required: true

        def resolve(review_id:, comment:)
            validate_user

            begin
                return ReviewComment.create!(user_id: context[:current_user].id, review_id: review_id, comment: comment)
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
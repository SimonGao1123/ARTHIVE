module Mutations
    class LikeReview < BaseMutation
        description "Like or unlike a review, returns true if like is created, false if like is destroyed"
        type Boolean, null: false

        argument :review_id, ID, required: true
        
        def resolve(review_id:)
            validate_user

            begin
                return ReviewLike.toggle_like(context[:current_user].id, review_id)
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
module Mutations
    class LikeReview < BaseMutation
        description "Like or unlike a review, returns true if like is created, false if like is destroyed"
        type Boolean, null: false

        argument :review_id, ID, required: true
        
        def resolve(review_id:)
            validate_user

            begin
                existing = ReviewLike.find_by(user_id: context[:current_user].id, review_id: review_id)
                liked = ReviewLike.toggle_like(context[:current_user].id, review_id)
                if liked
                    review_like = ReviewLike.find_by(user_id: context[:current_user].id, review_id: review_id)
                    Activity.log(user: context[:current_user], subject: review_like, status: "created")
                else
                    Activity.log(user: context[:current_user], subject: existing, status: "inactive") if existing
                end
                liked
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
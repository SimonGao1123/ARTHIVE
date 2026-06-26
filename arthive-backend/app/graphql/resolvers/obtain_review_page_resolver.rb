module Resolvers
    class ObtainReviewPageResolver < BaseResolver
        description "Obtains a page of reviews for a media, obtains the comments and media info"

        type Types::ReviewPageType, null: false

        argument :review_id, ID, required: true
        argument :query, String, required: false, default_value: nil

        def resolve(review_id:, query:)
            review = Review.includes(:review_comments, :review_likes, :user, :media).find_by(id: review_id)
            if review.nil?
                raise GraphQL::ExecutionError, "Review not found"
            end

            unless User.if_visible_to_user(context[:current_user]&.id, review.user_id)
                raise GraphQL::ExecutionError, "Review not found"
            end

            comments = review.review_comments
                .includes(:user)
                .where(user_id: User.visible_to(context[:current_user]&.id).select(:id))
                .in_order_of(:user_id, [context[:current_user]&.id], filter: false)
                .recent
                .query_filter(query)
            return {
                review: review,
                review_comments: comments
            }
        end
    end
end
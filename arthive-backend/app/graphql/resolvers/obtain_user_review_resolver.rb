module Resolvers
    class ObtainUserReviewResolver < BaseResolver
        type Types::ReviewType, null: true

        argument :media_id, Int, required: true

        def resolve(media_id:)
            validate_user

            begin
                review = Review.retrieve_review(context[:current_user].id, media_id)
                return review # returns the review if found
            rescue ActiveRecord::RecordNotFound => e
                return nil # returns nil if review is not found
            end
        end
    end
end
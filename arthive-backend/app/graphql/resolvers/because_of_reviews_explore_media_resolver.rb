module Resolvers
    class BecauseOfReviewsExploreMediaResolver < BaseResolver

        type Types::BecauseOfReviewsType, null: true
        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"

        def resolve(content_type: "all")
            validate_user

            because_of_reviews = Media.because_of_reviews(content_type: content_type, user_id: context[:current_user].id)
            return because_of_reviews

        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
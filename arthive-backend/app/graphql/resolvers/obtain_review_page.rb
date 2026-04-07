module Resolvers
    class ObtainReviewPageResolver < BaseResolver
        description "Obtains a page of reviews for a media, obtains the comments and media info"

        type Types::ReviewPageType, null: false

        argument :review_id, ID, required: true

        # pagination for review comments
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10

        def resolve(review_id:, page_num:, limit:)
            validate_user

            begin
                return Review.retrieve_review_page(review_id, page_num, limit, context[:current_user].id)
            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end
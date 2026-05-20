module Types
    class CreateReviewType < Types::BaseObject
        field :review, Types::ReviewType, null: true
        field :deleted, Boolean, null: false
    end
end
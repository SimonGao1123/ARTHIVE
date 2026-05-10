module Types
    class ReviewPageType < Types::BaseObject
        field :review, Types::ReviewType, null: false
        field :review_comments, Types::ReviewCommentType.connection_type, null: false
    end
end
module Types
    class ReviewPageType < Types::BaseObject
        field :review, Types::ReviewType, null: false
        field :review_comments, [Types::ReviewCommentType], null: true
        field :review_likes, [Types::ReviewLikeType], null: true
    end
end
module Types
    class AllUserReviewsType < Types::BaseObject
        field :reviews, [Types::ReviewType], null: false
        field :user, Types::UserType, null: false
    end
end
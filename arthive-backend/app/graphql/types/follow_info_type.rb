module Types
    class FollowInfoType < Types::BaseObject
        description "Information about a follow type, includes the count and array of follow types"

        field :user, Types::UserType, null: true
        field :count, Int, null: true
        field :follows, [Types::FollowType], null: true
    end
end
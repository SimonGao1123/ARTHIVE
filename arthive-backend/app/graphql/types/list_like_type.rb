module Types
    class ListLikeType < Types::BaseObject
        field :id, ID, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :user, Types::UserType, null: false
        field :list, Types::ListType, null: false
    end
end

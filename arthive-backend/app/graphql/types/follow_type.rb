module Types
    class FollowType < Types::BaseObject
        field :id, ID, null: false
        field :sender, UserType, null: false
        field :receiver, UserType, null: false
        field :status, String, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end
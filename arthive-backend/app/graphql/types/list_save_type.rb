module Types
    class ListSaveType < Types::BaseObject
        field :id, ID, null: false
        field :list, Types::ListType, null: false
        field :user, Types::UserType, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end
module Types
    class ListType < Types::BaseObject
        field :id, ID, null: false
        field :name, String, null: false
        field :content_type, [String], null: false
        field :if_private, Boolean, null: false
        field :tags, [String], null: false
        field :description, String, null: true
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
        field :user, Types::UserType, null: false
    end
end
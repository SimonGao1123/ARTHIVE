module Types
    class ReviewType < Types::BaseObject
        field :id, ID, null: false
        field :content, String, null: true
        field :rating, Int, null: false
        field :if_favorite, Boolean, null: false
        field :if_finished, Boolean, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

        field :user, Types::UserType, null: false
        field :media, Types::MediaType, null: false
    end
end

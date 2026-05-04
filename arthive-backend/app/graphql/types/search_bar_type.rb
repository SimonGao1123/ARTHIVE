module Types
    class SearchBarType < Types::BaseObject
        field :medias, [Types::MediaType], null: true
        field :users, [Types::UserType], null: true
        field :reviews, [Types::ReviewType], null: true
    end
end
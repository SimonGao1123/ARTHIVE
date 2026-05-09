module Types
    class SearchBarType < Types::BaseObject
        field :medias, Types::MediaType.connection_type, null: true
        field :users, Types::UserType.connection_type, null: true
        field :reviews, Types::ReviewType.connection_type, null: true
    end
end
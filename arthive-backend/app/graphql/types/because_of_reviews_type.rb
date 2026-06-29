module Types
    class BecauseOfReviewsType < Types::BaseObject
        field :media, Types::MediaType.connection_type, null: false
        field :source, Types::MediaType, null: false
    end
end
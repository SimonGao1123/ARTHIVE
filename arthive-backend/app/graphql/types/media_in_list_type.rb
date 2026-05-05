module Types
    class MediaInListType < Types::BaseObject
        field :id, ID, null: false
        field :media, Types::MediaType, null: false
        field :list, Types::ListType, null: false
    end
end
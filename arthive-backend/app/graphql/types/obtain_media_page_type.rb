module Types
    class ObtainMediaPageType < Types::BaseObject
        field :user, Types::UserType, null: false
        field :media, [Types::MediaType], null: false
        field :page_info, Types::OffsetPageInfoType, null: false
    end
end
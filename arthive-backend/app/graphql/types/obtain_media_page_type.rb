module Types
    class ObtainMediaPageType < Types::BaseObject
        field :media, [Types::MediaType], null: false
        field :page_info, Types::OffsetPageInfoType, null: false
    end
end
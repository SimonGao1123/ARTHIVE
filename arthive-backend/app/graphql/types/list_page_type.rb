module Types
    class ListPageType < Types::BaseObject
        field :list, Types::ListType, null: false
        field :media_in_lists, [Types::MediaInListType], null: false
        field :page_info, Types::OffsetPageInfoType, null: false
        field :user, Types::UserType, null: false
    end
end
module Types
    class LikesPageType < Types::BaseObject
        field :page_info, Types::OffsetPageInfoType, null: false
        field :media, [Types::MediaType], null: true
        field :reviews, [Types::ReviewType], null: true
        field :lists, [Types::ListType], null: true
        field :user, Types::UserType, null: false
    end
end
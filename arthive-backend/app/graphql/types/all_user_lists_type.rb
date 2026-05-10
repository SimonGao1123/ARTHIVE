module Types
    class AllUserListsType < Types::BaseObject
        field :lists, [Types::ListType], null: false
        field :user, Types::UserType, null: false
        field :page_info, Types::OffsetPageInfoType, null: false
    end
end
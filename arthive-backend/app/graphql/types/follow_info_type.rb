module Types
    class FollowInfoType < Types::BaseObject
        description "Information about a follow type, includes the user, the follows, the page info, and the count"

        field :user, Types::UserType, null: true
        field :follows, [Types::FollowType], null: true
        field :page_info, Types::OffsetPageInfoType, null: true
        field :count, Int, null: true
    end
end
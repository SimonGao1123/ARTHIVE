module Types
    class ThreadLikeType < Types::BaseObject
        field :id, ID, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :user, Types::UserType, null: false
        field :community_thread, Types::CommunityThreadType, null: false
    end
end

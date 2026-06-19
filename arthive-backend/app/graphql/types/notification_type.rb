module Types
    class NotificationType < Types::BaseObject
        field :id, ID, null: false
        field :sender, Types::UserType, null: false
        field :receiver, Types::UserType, null: false
        field :action, String, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false

        field :follow, Types::FollowType, null: true
        field :review, Types::ReviewType, null: true
        field :review_comment, Types::ReviewCommentType, null: true
        field :parent_thread, Types::CommunityThreadType, null: true
        field :comment_thread, Types::CommunityThreadType, null: true
        field :list, Types::ListType, null: true

    end
end
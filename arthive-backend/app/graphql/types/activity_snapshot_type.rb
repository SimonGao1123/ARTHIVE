module Types
    class ActivitySnapshotType < Types::BaseObject
        # Review
        field :content, String, null: true
        field :rating, Float, null: true
        field :if_favorite, Boolean, null: true
        field :if_finished, Boolean, null: true

        # ReviewComment
        field :comment, String, null: true

        # ReviewComment / ReviewLike
        field :reviewer_username, String, null: true

        # CommunityThread
        field :title, String, null: true
        field :thread_content, String, null: true

        # ThreadLike
        field :thread_title, String, null: true
        field :thread_author_username, String, null: true

        # List / MediaInList
        field :list_name, String, null: true

        # Human-readable action label (computed at write time)
        field :label, String, null: true
    end
end

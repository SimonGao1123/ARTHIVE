module Types
    class ActivityType < Types::BaseObject
        field :activity_snapshot, Types::ActivitySnapshotType, null: true
        field :id, ID, null: false
        field :activity_type, String, null: false
        field :subject, Types::ActivitySubjectType, null: true
        field :status, String, null: false
        field :user, Types::UserType, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end

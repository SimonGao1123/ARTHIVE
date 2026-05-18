module Types
    class ActivityType < Types::BaseObject
        field :id, ID, null: false
        field :activity_type, String, null: false
        field :subject, Types::ActivitySubjectType, null: false
        field :status, String, null: false
        field :user, Types::UserType, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    end
end

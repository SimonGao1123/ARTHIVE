module Types
    class ListMemberType < Types::BaseObject
        field :id, ID, null: false
        field :user, Types::UserType, null: false
        field :status, ListMemberStatusEnum, null: false
        field :role, ListMemberRoleEnum, null: false
        field :joined_at, GraphQL::Types::ISO8601DateTime, null: true
        field :list, Types::ListType, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
        field :sent_by_user, Types::UserType, null: true
    end
end
module Types
    class ListType < Types::BaseObject
        field :id, ID, null: false
        field :name, String, null: false
        field :content_type, [String], null: false
        field :if_private, Boolean, null: false
        field :tags, [String], null: false
        field :description, String, null: true
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
        field :media_in_lists, [Types::MediaInListType], null: false do
            argument :page_num, Integer, required: false, default_value: 1
            argument :limit, Integer, required: false, default_value: 10
        end
        field :user, Types::UserType, null: false

        def media_in_lists(page_num:, limit:)
            object.media_in_lists.includes(:media).recent.page(page_num, limit).to_a
        end
    end
end
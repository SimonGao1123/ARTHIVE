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
        field :user, Types::UserType, null: false

        field :like_count, Integer, null: false

        field :if_liked, Boolean, null: false

        field :if_editable, Boolean, null: true
        field :role, String, null: true
        
        field :public_list_members, [Types::ListMemberType], null: true
        field :all_list_members, [Types::ListMemberType], null: true

        def public_list_members
            return nil unless List.if_visible_to_user(context[:current_user].id, object)
            object.list_members.includes(:user).where(status: "accepted")
        end

        # includes pending members
        def all_list_members
            return nil unless List.editable_by_user(context[:current_user].id, object)
            object.list_members.includes(:user).where.not(status: "rejected")
        end

        def if_editable
            return nil unless context[:current_user]
            List.editable_by_user(context[:current_user].id, object)
        end
        def role
            return nil unless context[:current_user]
            if object.user_id == context[:current_user].id
                return "owner"
            end
            object.list_members.find_by(user_id: context[:current_user].id, status: "accepted")&.role || nil
        end

        def if_liked
            object.list_likes.exists?(user_id: context[:current_user].id)
        end
        
        field :media_in_lists, [Types::MediaInListType], null: false do
            argument :page_num, Integer, required: false, default_value: 1
            argument :limit, Integer, required: false, default_value: 10
        end

        def media_in_lists (page_num:, limit:)
            object.media_in_lists.includes(:media).recent.page(page_num, limit)
        end

        def like_count
            object.list_likes.count
        end

    end
end
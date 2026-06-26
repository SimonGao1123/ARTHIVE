module Resolvers
    class ObtainAllUserListsResolver < BaseResolver
        type Types::AllUserListsType, null: false

        argument :user_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :content_type, String, required: false, default_value: "all"
        argument :query, String, required: false, default_value: nil
        argument :role_filter, Types::ListMemberRoleEnum, required: false, default_value: nil
        
        argument :exclude_media_id, ID, required: false, default_value: nil

        def resolve(user_id:, page_num:, limit:, content_type:, query:, exclude_media_id:, role_filter:)
            validate_user
            current_user_id = context[:current_user]&.id

            if !User.if_visible_to_user(current_user_id&.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's lists"
            end

            user = User.find_by(id: user_id)

            if !user.present?
                raise GraphQL::ExecutionError, "User #{user_id} not found"
            end

            if exclude_media_id.present?
                if user_id.to_i != current_user_id.to_i
                    raise GraphQL::ExecutionError, "You are not allowed to exclude media from this user's lists"
                end
            end

            lists = List.content_type_filter(content_type).semantic_search(query, "list", nil).recent

            if role_filter.present?

                if role_filter == "owner"
                    lists = lists.where(user_id: user_id)
                elsif role_filter == "member" || role_filter == "admin"
                    lists = lists.where(id: ListMember.where(user_id: user_id, role: role_filter, status: "accepted").select(:list_id))
                elsif role_filter == "saved"
                    lists = lists.where(id: ListSave.where(user_id: user_id).select(:list_id))
                end
            elsif exclude_media_id.present?
                lists = lists.where.not(id: MediaInList.select(:list_id).where(media_id: exclude_media_id))
                lists = lists.user_editable_filter(current_user_id)
            else
                membership_ids = List.user_membership_filter(user_id).select(:id)
                saved_ids = ListSave.where(user_id: user_id).select(:list_id)
                lists = lists.where(id: membership_ids).or(lists.where(id: saved_ids))
            end

            # NOTE IF EXCLUDED MEDIA EXISTS THEN USER IS TRYING TO ADD MEDIA TO LIST
            # IF ADDING MEDIA TO LIST, ONLY DISPLAY YOUR OWN LISTS
            
            lists = lists.user_visible_filter(current_user_id)

            total_count = lists.count
            total_pages = (total_count.to_f / limit).ceil

            lists = lists.page(page_num, limit).includes(:user, :list_likes, list_members: :user)
            return {
                lists: lists,
                user: user,
                page_info: {
                    total_pages: total_pages,
                    total_count: total_count
                }
            }
        end
    end
end
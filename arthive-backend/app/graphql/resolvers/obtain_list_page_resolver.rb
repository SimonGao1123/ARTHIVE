module Resolvers
    class ObtainListPageResolver < BaseResolver
        type Types::ListPageType, null: false

        argument :list_id, ID, required: true
        argument :page_num, Int, required: false, default_value: 1
        argument :limit, Int, required: false, default_value: 10
        argument :query, String, required: false, default_value: nil

        def resolve(list_id:, page_num:, limit:, query:)
            validate_user

            list = List.includes(media_in_lists: :media).find_by(id: list_id)
            user = list.user

            if list.if_private && user.id.to_i != context[:current_user].id.to_i
                raise GraphQL::ExecutionError, "You are not allowed to access this list"
            end

            if !list.present?
                raise GraphQL::ExecutionError, "List #{list_id} not found"
            end

            if !User.if_visible_to_user(context[:current_user].id.to_i, list.user.id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this list"
            end

            list_media = list.media_in_lists.includes(:media).recent.query_filter(query)
            total_count = list_media.count
            total_pages = (total_count.to_f / limit).ceil
            list_media = list_media.page(page_num, limit)

            return {
                list: list,
                media_in_lists: list_media,
                page_info: {
                    total_pages: total_pages,
                    total_count: total_count
                },
                user: user
            }
        end
    rescue ActiveRecord::RecordNotFound => e
        raise GraphQL::ExecutionError, e.message
    rescue GraphQL::ExecutionError => e
        raise GraphQL::ExecutionError, e.message
    end
end
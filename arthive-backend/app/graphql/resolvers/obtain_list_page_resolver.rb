module Resolvers
    class ObtainListPageResolver < BaseResolver
        type Types::ListType, null: false

        argument :list_id, ID, required: true

        def resolve(list_id:)
            validate_user

            list = List.includes(media_in_lists: :media).find_by(id: list_id)

            if list.if_private && list.user.id.to_i != context[:current_user].id.to_i
                raise GraphQL::ExecutionError, "You are not allowed to access this list"
            end

            if !list.present?
                raise GraphQL::ExecutionError, "List #{list_id} not found"
            end

            if !User.if_visible_to_user(context[:current_user].id.to_i, list.user.id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this list"
            end

            return list
        end
    rescue ActiveRecord::RecordNotFound => e
        raise GraphQL::ExecutionError, e.message
    rescue GraphQL::ExecutionError => e
        raise GraphQL::ExecutionError, e.message
    end
end
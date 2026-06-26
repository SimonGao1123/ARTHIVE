module Resolvers
    class ObtainTrendingListsResolver < BaseResolver
        type Types::ListType.connection_type, null: false

        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"

        def resolve(content_type:)
            lists = List.trending_lists(content_type: content_type, user_id: context[:current_user]&.id)
                        .includes(:user, :list_likes, list_members: :user)
            return lists
        end

        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
    end
end
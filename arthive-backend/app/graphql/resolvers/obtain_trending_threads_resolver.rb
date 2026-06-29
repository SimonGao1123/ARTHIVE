module Resolvers
    class ObtainTrendingThreadsResolver < BaseResolver
        type [Types::CommunityThreadType], null: false

        argument :media_id_scope, ID, required: false, default_value: nil
        argument :limit, Int, required: false, default_value: 10

        def resolve(media_id_scope:, limit:)
            if limit < 1 || limit > 100
                raise GraphQL::ExecutionError, "Limit must be between 1 and 100"
            end

            threads = CommunityThread.sort_by_trending
                .with_attached_images
                .preload(
                    { user: { profile_picture_attachment: :blob } },
                    { community: :media },
                    :thread_likes,
                    :child_threads
                )
                .where(user_id: User.visible_to(context[:current_user]&.id).select(:id))

            if media_id_scope.present?
                threads = threads.joins(:community).where(communities: { media_id: media_id_scope })
            end

            threads.limit(limit)
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end

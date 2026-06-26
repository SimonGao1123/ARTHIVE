module Resolvers
    class HottestExploreMediaResolver < BaseResolver
        type Types::MediaType.connection_type, null: false

        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"

        def resolve(content_type:)
            Media.hottest_explore_page(content_type: content_type, user_id: context[:current_user]&.id)
                .includes(:user, :community)
                .with_attached_cover_image
        end
    end
end
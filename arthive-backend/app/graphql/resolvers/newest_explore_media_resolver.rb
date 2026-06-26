module Resolvers
    class NewestExploreMediaResolver < BaseResolver
        type Types::MediaType.connection_type, null: false


        argument :content_type, Types::ContentTypeEnum, required: false

        def resolve(content_type: "all")
            Media.newest_explore_page(content_type: content_type, user_id: context[:current_user]&.id)
                .includes(:user, :community)
                .with_attached_cover_image
        end
    end
end
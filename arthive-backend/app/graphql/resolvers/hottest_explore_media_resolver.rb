module Resolvers
    class HottestExploreMediaResolver < BaseResolver
        type Types::MediaType.connection_type, null: false

        argument :content_type, String, required: false, default_value: "all"

        def resolve(content_type:)
            validate_user

            media = Media.hottest_explore_page(content_type: content_type, user_id: context[:current_user].id)
            return media
        end
    end
end
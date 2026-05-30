module Resolvers
    class NewestExploreMediaResolver < BaseResolver
        type Types::MediaType.connection_type, null: false


        argument :content_type, Types::ContentTypeEnum, required: false

        def resolve(content_type: "all")
            validate_user
            
            media_page = Media.newest_explore_page(content_type: content_type, user_id: context[:current_user].id)
            
            
    
            media_page
        end
    end
end
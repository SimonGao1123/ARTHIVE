module Resolvers
    class ExploreMediaResolver < BaseResolver
        type Types::ExploreMediaType, null: false


        argument :content_type, String, required: false
        argument :limit, Integer, required: false
        argument :page_num, Integer, required: false

        def resolve(content_type: "all", limit: 10, page_num: 1)
            validate_user
            # TODO: ADD CODE FOR ONLY RETURNING MEDIA FOR NOT SEEN MEDIA
            
            if_prev_page = page_num > 1
            media_page = Media.explore_page(content_type, page_num, limit, context[:current_user].id).to_a
            
            if_next_page = Media.if_next_page_exists(content_type, page_num, limit, context[:current_user].id)
            
            {
                media: media_page,
                if_prev_page: if_prev_page,
                if_next_page: if_next_page,
                page_num: page_num
            }
        end
    end
end
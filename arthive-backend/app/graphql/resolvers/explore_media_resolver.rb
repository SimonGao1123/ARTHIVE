module Resolvers
    class ExploreMediaResolver < BaseResolver
        type Types::ExploreMediaType, null: false


        argument :content_type, String, required: false
        argument :limit, Integer, required: false
        argument :page_num, Integer, required: false

        def resolve(content_type: "any", limit: 10, page_num: 1)
            auth = context[:auth_error]
            if auth.in?(%w[EXPIRED_TOKEN INVALID_TOKEN NO_TOKEN USER_NOT_FOUND]) || context[:current_user].blank?
                raise GraphQL::ExecutionError, auth
            end
            # TODO: ADD CODE FOR ONLY RETURNING MEDIA FOR NOT SEEN MEDIA
            
            if_prev_page = page_num > 1
            media_page = Media.explore_page(content_type, page_num, limit).to_a
            
            if_next_page = Media.if_next_page_exists(content_type, page_num, limit)
            
            {
                media: media_page,
                if_prev_page: if_prev_page,
                if_next_page: if_next_page,
                page_num: page_num
            }
        end
    end
end
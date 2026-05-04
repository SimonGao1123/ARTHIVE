module Resolvers
    class SearchBarResolver < BaseResolver
        # TODO: ADD MORE TYPES TO RETURN, usually only 1 type is returned, all others are null
        type Types::SearchBarType, null: false

        argument :query, String, required: true

        # type is for the type of content (e.g users, media, reviews, all)
        argument :search_type, Types::SearchTypeEnum, required: true

        argument :search_filter, [Types::SearchFilterInput], required: false

        # pagination
        argument :page_num, Int, required: true
        argument :limit, Int, required: true

        def resolve(query:, search_type:, search_filter: nil, page_num:, limit:)
            results = {}

            medias = []
            users = []
            reviews = []

            case search_type
            when "media"
                medias = Media.search(query: query, search_filter: search_filter, page_num: page_num, limit: limit).to_a
            end

            results[:medias] = medias
            results[:users] = users
            results[:reviews] = reviews
            return results
        end
    end
end
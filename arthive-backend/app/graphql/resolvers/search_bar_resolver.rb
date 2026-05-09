module Resolvers
    class SearchBarResolver < BaseResolver
        # TODO: ADD MORE TYPES TO RETURN, usually only 1 type is returned, all others are null
        type Types::SearchBarType, null: false

        argument :query, String, required: true

        # type is for the type of content (e.g users, media, reviews, all)
        argument :search_type, Types::SearchTypeEnum, required: true

        argument :search_filter, [Types::SearchFilterInput], required: false

        def resolve(query:, search_type:, search_filter: nil)
            validate_user

            results = {}

            medias = []
            users = []
            reviews = []

            case search_type
            when "media"
                medias = Media.search(query: query, search_filter: search_filter)
            when "user"
                users = User.search(query: query, current_user_id: context[:current_user].id)
            end

            results[:medias] = medias
            results[:users] = users
            results[:reviews] = reviews
            return results
        end
    end
end
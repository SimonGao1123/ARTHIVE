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

            raise GraphQL::ExecutionError, "Invalid search type" unless %w[media user review list thread all].include?(search_type)

            embedded_query = EmbeddingService.embed(query) unless search_type == "user"
            # embed the query before hand, so don't have to embed query on each model

            {
                medias:  search_type.in?(%w[media all])  ? Media.search(query: query, embedded_query: embedded_query, search_filter: search_filter) : [],
                users:   search_type.in?(%w[user all])   ? User.search(query: query, current_user_id: context[:current_user].id) : [],
                reviews: search_type.in?(%w[review all]) ? Review.search(query: query, embedded_query: embedded_query, search_filter: search_filter, current_user_id: context[:current_user].id) : [],
                lists:   search_type.in?(%w[list all])   ? List.search(query: query, embedded_query: embedded_query, search_filter: search_filter, current_user_id: context[:current_user].id) : [],
                threads: search_type.in?(%w[thread all]) ? CommunityThread.search(query: query, embedded_query: embedded_query, search_filter: search_filter, current_user_id: context[:current_user].id) : []
            }
        end
    end
end
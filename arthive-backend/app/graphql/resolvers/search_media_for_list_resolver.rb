module Resolvers
    class SearchMediaForListResolver < BaseResolver
        description "Search for media to be added to a list (excludes media already in the list)"
        type Types::MediaType.connection_type, null: false

        argument :query, String, required: true
        argument :list_id, ID, required: true

        def resolve(query:, list_id:)
            validate_user
            
            list = List.find(list_id)
            if !list.present?
                raise GraphQL::ExecutionError, "List #{list_id} not found"
            end

            if !List.editable_by_user(context[:current_user].id, list)
                raise GraphQL::ExecutionError, "You are not allowed to search for media in this list"
            end

            base_search = Media.semantic_search(query, "media", nil).includes(:user, :community).with_attached_cover_image

            unavailable_media_ids = list.media_in_lists.select(:media_id)
            base_search = base_search.where.not(id: unavailable_media_ids)

            return base_search
        end
    end
end
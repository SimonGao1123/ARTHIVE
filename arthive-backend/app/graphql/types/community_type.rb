module Types
    class CommunityType < Types::BaseObject
        field :id, ID, null: false
        field :media, Types::MediaType, null: false
        
        field :root_threads, Types::CommunityThreadType.connection_type, null: false do
            argument :query, String, required: false
        end

        def root_threads(query: nil)
            object.root_threads(context[:current_user].id)
            .query_filter(query)
        end
    end
end
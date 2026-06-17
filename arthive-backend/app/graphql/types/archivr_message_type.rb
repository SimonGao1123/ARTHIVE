module Types
    class ArchivrMessageType < Types::BaseObject
        field :id, ID, null: false
        field :content, String, null: false
        field :role, String, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false

        field :review_refs, [Types::ReviewType], null: true
        field :list_refs, [Types::ListType], null: true
        field :thread_refs, [Types::CommunityThreadType], null: true
        field :media_refs, [Types::MediaType], null: true

        # NOTE: `references` is a JSONB column → keys come back as strings, not symbols.
        # Use `.compact` to drop nils from deleted records (frontend renders a placeholder for those).

        def review_refs
            ids = object.references&.dig("review_ids") || []
            Review.where(id: ids).includes(:user, :media)
        end

        def list_refs
            ids = object.references&.dig("list_ids") || []
            List.where(id: ids).includes(:user, media_in_lists: :media)
        end

        def thread_refs
            ids = object.references&.dig("thread_ids") || []
            CommunityThread.where(id: ids).includes(:user, community: :media)
        end

        def media_refs
            ids = object.references&.dig("media_ids") || []
            Media.where(id: ids)
        end
    end
end

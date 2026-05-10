# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :whoami, resolver: Resolvers::WhoamiResolver
    field :explore_media, resolver: Resolvers::ExploreMediaResolver
    field :obtain_media_info, resolver: Resolvers::ObtainMediaInfoResolver
    field :search_bar, resolver: Resolvers::SearchBarResolver
    
    field :obtain_media_reviews, resolver: Resolvers::ObtainMediaReviewsResolver
    field :obtain_user_review, resolver: Resolvers::ObtainUserReviewResolver
    field :obtain_all_user_reviews, resolver: Resolvers::ObtainAllUserReviewsResolver
    field :obtain_review_page, resolver: Resolvers::ObtainReviewPageResolver
    field :obtain_all_user_lists, resolver: Resolvers::ObtainAllUserListsResolver
    field :obtain_follower_info, resolver: Resolvers::ObtainFollowerInfoResolver
    field :obtain_list_page, resolver: Resolvers::ObtainListPageResolver
    field :obtain_user_profile, resolver: Resolvers::ObtainUserProfileResolver
  end
end

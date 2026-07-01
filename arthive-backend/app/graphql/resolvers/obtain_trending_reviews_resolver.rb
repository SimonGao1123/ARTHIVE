module Resolvers
    class ObtainTrendingReviewsResolver < BaseResolver
        type Types::ReviewType.connection_type, null: false

        argument :content_type, Types::ContentTypeEnum, required: false, default_value: "all"
        def resolve(content_type: "all")
        
            reviews = Review
            .sort_by_trending.includes(:user, :media)
            .with_attached_images
            .content_type_filter(content_type)
            .where(user_id: User.visible_to(context[:current_user]&.id).select(:id))
            .recent
            .limit(50)

            return reviews
        end
    end
end
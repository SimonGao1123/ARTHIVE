module Types
    class ReviewType < Types::BaseObject
        field :id, ID, null: false
        field :content, String, null: true
        field :rating, Float, null: true
        field :if_favorite, Boolean, null: false
        field :if_finished, Boolean, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

        field :user, Types::UserType, null: false
        field :media, Types::MediaType, null: false

        field :review_comments, [Types::ReviewCommentType], null: true
        field :review_likes, [Types::ReviewLikeType], null: true

        field :like_count, Integer, null: false
        field :comment_count, Integer, null: false

        field :if_liked, Boolean, null: false

        field :image_details, [Types::ImageDetailsType], null: true

        def image_details
            object.images_blobs.map do |blob|
                {
                    signed_id: blob.signed_id,
                    url: blob.url(expires_in: 1.hour)
                }
            end
        end

        def if_liked
            object.review_likes.exists?(user_id: context[:current_user].id)
        end

        def like_count
            object.review_likes.count
        end

        def comment_count
            object.review_comments.count
        end
        
    end
end

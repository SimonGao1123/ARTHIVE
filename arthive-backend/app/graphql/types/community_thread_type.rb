module Types
    class CommunityThreadType < Types::BaseObject
        field :id, ID, null: false

        field :title, String, null: true
        field :content, String, null: false
        field :created_at, GraphQL::Types::ISO8601DateTime, null: false
        field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

        field :user, Types::UserType, null: false
        field :community, Types::CommunityType, null: false

        
        field :parent_thread_id, ID, null: true
        field :root_thread_id, ID, null: true

        field :image_details, [Types::ImageDetailsType], null: true

        field :review, Types::ReviewType, null: true
        field :depth, Int, null: false
        field :has_review, Boolean, null: false

        def has_review
            object.review_id.present?
        end

        def review
            return nil unless object.review_id.present?
            reviewed = object.review
            return nil unless reviewed
            return nil unless dataloader.with(Sources::UserVisibility, context[:current_user]&.id).load(reviewed.user_id)
            reviewed
        rescue GraphQL::ExecutionError
            nil
        end

        def image_details
            object.images_blobs.map do |blob|
                {
                    signed_id: blob.signed_id,
                    url: blob.url(expires_in: 1.hour)
                }
            end
        end

        def parent_thread
            if object.parent_thread.present?
                return object.parent_thread.id
            else
                return nil
            end 
        end
        def root_thread
            if object.root_thread.present?
                return object.root_thread.id
            else
                return nil
            end
        end



        field :child_threads, Types::CommunityThreadType.connection_type, null: true

        field :likes_count, Int, null: false
        
        field :child_threads_count, Int, null: false
        def child_threads_count
            object.child_threads_count
        end

        def likes_count
            object.thread_likes_count
        end

        field :if_liked, Boolean, null: false

        def if_liked
            return false unless context[:current_user]
            if object.thread_likes.loaded?
                object.thread_likes.any? { |like| like.user_id == context[:current_user].id }
            else
                object.thread_likes.exists?(user: context[:current_user])
            end
        end

        def child_threads
            object.child_threads
                .with_attached_images
                .includes(
                    { user: { profile_picture_attachment: :blob } },
                    { community: :media },
                    :thread_likes
                )
                .where(user_id: User.visible_to(context[:current_user]&.id).select(:id))
                .order_threads(context[:current_user]&.id)
        end


    end
end
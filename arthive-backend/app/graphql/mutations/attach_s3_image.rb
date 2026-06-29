module Mutations
    class AttachS3Image < BaseMutation
        field :success, Boolean, null: false

        argument :signed_ids, [String], required: true
        argument :resource_id, ID, required: true
        argument :resource_type, Types::PossibleResourceImageTypesEnum, required: true

        def resolve(signed_ids:, resource_id:, resource_type:)
            validate_user
            
            case resource_type
            when "media"
                if !context[:current_user].if_admin?
                    raise GraphQL::ExecutionError, "You are not an admin"
                end
                media = Media.find_by(id: resource_id)
                if media.nil?
                    raise GraphQL::ExecutionError, "Media not found"
                end
                # media and users only have one image attached
                media.cover_image.attach(signed_ids[0])
            when "user"
                user = User.find_by(id: resource_id)
                if user.nil?
                    raise GraphQL::ExecutionError, "User not found"
                end
                user.profile_picture.attach(signed_ids[0])
            when "review"
                review = Review.find_by(id: resource_id)
                if review.nil?
                    raise GraphQL::ExecutionError, "Review not found"
                end
                review.images.attach(signed_ids)
            when "community_thread"
                community_thread = CommunityThread.find_by(id: resource_id)
                if community_thread.nil?
                    raise GraphQL::ExecutionError, "Community thread not found"
                end
                community_thread.images.attach(signed_ids)
            else
                raise GraphQL::ExecutionError, "Invalid resource type"
            end

            return { success: true }
        end
    end
end
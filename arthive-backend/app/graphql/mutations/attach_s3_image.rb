module Mutations
    class AttachS3Image < BaseMutation
        field :success, Boolean, null: false

        argument :signed_id, String, required: true
        argument :resource_id, ID, required: true
        argument :resource_type, Types::PossibleResourceImageTypesEnum, required: true

        def resolve(signed_id:, resource_id:, resource_type:)
            validate_user
            
            case resource_type
            when "media"
                media = Media.find_by(id: resource_id)
                if media.nil?
                    raise GraphQL::ExecutionError, "Media not found"
                end
                media.cover_image.attach(signed_id)
            when "user"
                user = User.find_by(id: resource_id)
                if user.nil?
                    raise GraphQL::ExecutionError, "User not found"
                end
                user.profile_picture.attach(signed_id)
            else
                raise GraphQL::ExecutionError, "Invalid resource type"
            end

            return { success: true }
        end
    end
end
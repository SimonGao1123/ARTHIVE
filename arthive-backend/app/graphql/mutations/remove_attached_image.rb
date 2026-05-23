module Mutations
    class RemoveAttachedImage < BaseMutation
        type Boolean, null: false

        argument :signed_ids, [String], required: true
        argument :resource_id, ID, required: true
        argument :resource_type, Types::PossibleResourceImageTypesEnum, required: true

        def resolve(signed_ids:, resource_id:, resource_type:)
            validate_user
            
            case resource_type
                # only supports reviews for NOW
            when "review"
                review = Review.find_by(id: resource_id)
                if !review.present?
                    raise GraphQL::ExecutionError, "Review #{resource_id} not found"
                end
                if review.user.id != context[:current_user].id
                    raise GraphQL::ExecutionError, "You are not the owner of review #{resource_id}"
                end
                signed_ids.each do |signed_id|
                    blob = ActiveStorage::Blob.find_signed(signed_id)
                    image = review.images_attachments.find_by(blob: blob)
                    if !image.present?
                        raise GraphQL::ExecutionError, "Image #{signed_id} not found"
                    end
                    image.purge
                end
            end
            return true
        end
    end
end
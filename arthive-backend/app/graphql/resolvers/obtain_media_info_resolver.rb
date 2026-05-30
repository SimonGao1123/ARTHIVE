module Resolvers
    class ObtainMediaInfoResolver < BaseResolver
        type Types::MediaType, null: false

        argument :mediaId, Integer, required: true

        def resolve(mediaId:)
            validate_user

            media = Media.find_by(id: mediaId)
            if media.blank?
                raise GraphQL::ExecutionError, "Media not found"
            end

            media
            
        end

    end
end
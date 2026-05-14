module Resolvers
    class ObtainCommunityResolver < BaseResolver
        type Types::CommunityType, null: false

        argument :media_id, ID, required: true

        def resolve(media_id:)
            validate_user

            media = Media.find_by(id: media_id)

            if media.blank?
                raise GraphQL::ExecutionError, "Media not found"
            end


            community = media.community
            return community
        end
    end
end
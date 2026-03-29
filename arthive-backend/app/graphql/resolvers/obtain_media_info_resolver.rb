module Resolvers
    class ObtainMediaInfoResolver < BaseResolver
        type Types::MediaType, null: false

        argument :mediaId, Integer, required: true

        def resolve(mediaId:)
            auth = context[:auth_error]
            if auth.in?(%w[EXPIRED_TOKEN INVALID_TOKEN NO_TOKEN USER_NOT_FOUND]) || context[:current_user].blank?
                raise GraphQL::ExecutionError, auth
            end

            media = Media.find_by(id: mediaId)
            if media.blank?
                raise GraphQL::ExecutionError, "Media not found"
            end

            media
            
        end

    end
end
module Resolvers
    class ObtainArchivrConversationResolver < Resolvers::BaseResolver
        type Types::ArchivrMessageType.connection_type, null: true

        argument :media_id, ID, required: true
        argument :user_id, ID, required: true

        def resolve(media_id:, user_id:)
            validate_user

            conversation = ArchivrConversation.find_by(media_id: media_id, user_id: user_id)
            if !conversation.present?
                return nil
            end

            messages = conversation.archivr_messages.order(created_at: :desc)
            return messages
        end
    end
end
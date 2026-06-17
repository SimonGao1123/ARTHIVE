module Resolvers
    class ObtainArchivrConversationResolver < Resolvers::BaseResolver
        type Types::ArchivrMessageType.connection_type, null: true

        argument :media_id, ID, required: true

        def resolve(media_id:)
            validate_user

            conversation = ArchivrConversation.find_by(media_id: media_id, user_id: context[:current_user].id)
            return nil unless conversation.present?

            conversation.archivr_messages.order(created_at: :desc)
        end
    end
end

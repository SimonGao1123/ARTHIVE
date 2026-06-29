module Resolvers
    class ObtainArchivrConversationResolver < Resolvers::BaseResolver
        type Types::ArchivrDisplayConversationType, null: true

        argument :media_id, ID, required: true

        def resolve(media_id:)
            validate_user

            conversation = ArchivrConversation.find_by(media_id: media_id, user_id: context[:current_user].id)
            return nil unless conversation.present?

            messages = conversation.archivr_messages.order(created_at: :desc)

            recommended_prompts = conversation.archivr_messages
                                            .where("prompt_rating >= 8")
                                            .order(prompt_rating: :desc)
                                            .limit(3)
                                            .pluck(:content)

            return {
                messages: messages,
                recommended_prompts: recommended_prompts
            }
        end
    end
end

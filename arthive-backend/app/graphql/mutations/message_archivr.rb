module Mutations
    class MessageArchivr < BaseMutation
        argument :media_id, ID, required: true
        argument :query, String, required: true

        type Types::ArchivrMessageType, null: true

        def resolve(media_id:, query:)
            validate_user
            return nil if query.blank? || query.length < 3

            message = ArchivrService.generate_response(query, media_id, context[:current_user].id)
            if message.nil?
                raise GraphQL::ExecutionError, "Failed to generate response"
            end

            message

        end
    end

end

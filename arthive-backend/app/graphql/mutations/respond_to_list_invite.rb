module Mutations
    class RespondToListInvite < BaseMutation
        description "Accept a list invite"
        type Types::ListMemberType, null: false

        argument :list_member_id, ID, required: true
        argument :accept, Boolean, required: true

        def resolve(list_member_id:, accept:)
            validate_user

            list_member = ListMember.find_by(id: list_member_id)

            if list_member.blank?
                raise GraphQL::ExecutionError, "List member not found"
            end

            if list_member.user_id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the recipient of this invite"
            end

            list_member.respond_to_invite(accept)

            if !accept
                list_member.list.normalize_likes_saves_for_list
            end

            if accept
                SQS_CLIENT.send_message(
                    queue_url: SQS_QUEUE_URL,
                    message_body: {
                        type: "notification",
                        action: "list_invite_accepted",
                        sender_id: context[:current_user].id,
                        receiver_id: list_member.sent_by_user_id,
                        list_member_id: list_member.id,
                    }.to_json
                )
            end

            return list_member
        rescue ActiveRecord::RecordInvalid => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end
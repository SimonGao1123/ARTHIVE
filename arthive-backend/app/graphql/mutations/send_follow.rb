module Mutations
    class SendFollow < BaseMutation
        description "Send a follow request to a user"
        type Types::FollowType, null: false

        argument :receiver_id, ID, required: true

        def resolve(receiver_id:)
            validate_user

            begin
                follow = Follow.send_follow(context[:current_user].id, receiver_id.to_i)

                SQS_CLIENT.send_message(
                    queue_url: SQS_NOTIFICATION_QUEUE_URL,
                    message_body: {
                        action: follow.status == Follow::STATUSES[:accepted] ? "followed" : "follow_request",
                        sender_id: context[:current_user].id,
                        receiver_id: receiver_id,
                        follow_id: follow.id
                    }.to_json
                )
                return follow
            rescue GraphQL::ExecutionError => e
                raise GraphQL::ExecutionError, e.message
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end
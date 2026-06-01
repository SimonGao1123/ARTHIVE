module Mutations
    class ManipulateFollow < BaseMutation
        description "Manipulate a follow, accept, reject, unfollow, or cancel"

        type Types::FollowType, null: false

        argument :follow_id, ID, required: true
        argument :manipulation, Types::FollowManipulationEnum, required: true

        def resolve(follow_id:, manipulation:)
            validate_user

            begin
                follow = Follow.find_by(id: follow_id)
                if follow.blank?
                    raise GraphQL::ExecutionError, "Follow not found"
                end

                if manipulation == "accept" || manipulation == "reject"
                    SQS_CLIENT.send_message(
                        queue_url: SQS_QUEUE_URL,
                        message_body: {
                            type: "notification",
                            action: manipulation == "accept" ? "follow_request_accepted" : "follow_request_rejected",
                            sender_id: context[:current_user].id,
                            receiver_id: follow.sender_id,
                            follow_id: follow.id
                        }.to_json
                    )
                end

                return Follow.manipulate_follow(context[:current_user].id, follow, manipulation)
            rescue GraphQL::ExecutionError => e
                raise GraphQL::ExecutionError, e.message
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end
module Mutations
    class SendFollow < BaseMutation
        description "Send a follow request to a user"
        type Types::FollowType, null: false

        argument :receiver_id, ID, required: true

        def resolve(receiver_id:)
            validate_user

            begin
                return Follow.send_follow(context[:current_user].id, receiver_id.to_i)
            rescue GraphQL::ExecutionError => e
                raise GraphQL::ExecutionError, e.message
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end
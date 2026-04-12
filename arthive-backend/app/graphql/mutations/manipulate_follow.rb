module Mutations
    class ManipulateFollow < BaseMutation
        description "Manipulate a follow, accept, reject, unfollow, or cancel"

        type Types::FollowType, null: false

        argument :follow_id, ID, required: true
        argument :manipulation, Types::FollowManipulationEnum, required: true

        def resolve(follow_id:, manipulation:)
            validate_user

            begin
                return Follow.manipulate_follow(context[:current_user].id, follow_id.to_i, manipulation)
            rescue GraphQL::ExecutionError => e
                raise GraphQL::ExecutionError, e.message
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end
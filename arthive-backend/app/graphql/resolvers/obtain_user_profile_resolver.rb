module Resolvers
    class ObtainUserProfileResolver < Resolvers::BaseResolver
        type Types::UserProfileType, null: false

        argument :user_id, ID, required: true

        def resolve(user_id:)
            validate_user

            User.obtain_user_profile(user_id, context[:current_user].id)
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        rescue GraphQL::ExecutionError => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end

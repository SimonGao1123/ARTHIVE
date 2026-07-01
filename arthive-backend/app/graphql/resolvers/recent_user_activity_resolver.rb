module Resolvers
    class RecentUserActivityResolver < BaseResolver
        type Types::ActivityType.connection_type, null: false

        argument :user_id, ID, required: true
        argument :filter, Types::ActivityFilterEnum, required: false, default_value: "all"

        def resolve(user_id:, filter:)
            validate_user

            unless User.if_visible_to_user(context[:current_user].id.to_i, user_id.to_i)
                raise GraphQL::ExecutionError, "You are not allowed to access this user's activity"
            end

            Activity.where(user_id: user_id).where.not(status: "inactive")
                    .for_filter(filter)
                    .includes(:subject)
                    .recent
        end
    end
end

module Resolvers
    class RecentFollowingActivityResolver < BaseResolver
        type Types::ActivityType.connection_type, null: false

        argument :filter, Types::ActivityFilterEnum, required: false, default_value: "all"

        def resolve(filter:)
            validate_user # just for current context user

            Activity.where(user_id: User.currently_following(context[:current_user].id)).where.not(status: "inactive")
                    .for_filter(filter)
                    .includes(:subject)
                    .includes(:user)
                    .recent
        end
    end
end
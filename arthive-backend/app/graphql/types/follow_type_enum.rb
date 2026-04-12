module Types
    class FollowTypeEnum < BaseEnum
        value "followers", "Followers"
        value "following", "Following"
        value "pending_sent_follows", "Pending Sent Follows"
        value "pending_received_follows", "Pending Received Follows"
    end
end
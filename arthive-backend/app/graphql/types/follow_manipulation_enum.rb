module Types
    class FollowManipulationEnum < BaseEnum
        value "accept", "Accept a follow request"
        value "reject", "Reject a follow request"
        value "unfollow", "Unfollow a user"
        value "cancel", "Cancel a follow request"
    end
end
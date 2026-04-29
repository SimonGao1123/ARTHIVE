module Types
    class UserProfileType < Types::BaseObject
        field :user, Types::UserType, null: false

        
        # null if user is yourself, or not following
        field :current_outgoing_follow, Types::FollowType, null: true
        field :current_incoming_follow, Types::FollowType, null: true

        field :is_visible_to_user, Boolean, null: false

        field :total_reviews_count, Int, null: true
        
        # null if user is not visible to the current user
        field :all_finished_count, Int, null: true
        field :film_finished_count, Int, null: true
        field :series_finished_count, Int, null: true
        field :book_finished_count, Int, null: true
        field :game_finished_count, Int, null: true
    end
end
module Types
    class UserProfileType < Types::BaseObject
        field :user, Types::UserType, null: false

        
        # null if user is yourself, or not following
        field :current_outgoing_follow, Types::FollowType, null: true
        field :current_incoming_follow, Types::FollowType, null: true

        field :is_visible_to_user, Boolean, null: false

        field :total_reviews_count, Int, null: true
        field :all_finished_count, Int, null: true
        field :all_liked_count, Int, null: true
        # null if user is not visible to the current user
        field :total_lists_count, Int, null: true
        field :total_community_threads_count, Int, null: true

        field :film_reviews_count, Int, null: true
        field :series_reviews_count, Int, null: true
        field :book_reviews_count, Int, null: true
        field :game_reviews_count, Int, null: true





        field :edit_access, Boolean, null: false
        
        def edit_access
            object[:user].id == context[:current_user].id
        end
    end
end
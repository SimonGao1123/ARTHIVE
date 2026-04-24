# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :email, String, null: false
    field :username, String, null: false
    field :description, String, null: true
    field :if_admin, Boolean, null: false

    field :profile_picture, String, null: true

    field :reviews, [Types::ReviewType], null: true
    field :review_comments, [Types::ReviewCommentType], null: true
    field :review_likes, [Types::ReviewLikeType], null: true

    field :visibility, String, null: false

    field :followers_count, Int, null: false
    field :following_count, Int, null: false
    field :pending_sent_follows_count, Int, null: true 
    field :pending_received_follows_count, Int, null: true

    # must be yourself to see pending follows count
    def pending_sent_follows_count
      if context[:current_user].id != object.id
        return nil
      end
      return object.pending_sent_follows_count
    end
    def pending_received_follows_count
      if context[:current_user].id != object.id
        return nil
      end
      return object.pending_received_follows_count
    end

    def reviews 
      existing_follow = Follow.get_existing_follow(context[:current_user].id, object.id)
      if_visible_to_user = User.if_visible_to_user(context[:current_user].id, object.id, existing_follow&.status)
      if if_visible_to_user
        return object.reviews
      else
        return []
      end
    end
    def review_comments
      existing_follow = Follow.get_existing_follow(context[:current_user].id, object.id)
      if_visible_to_user = User.if_visible_to_user(context[:current_user].id, object.id, existing_follow&.status)
      if if_visible_to_user
        return object.review_comments
      else
        return []
      end
    end

    def review_likes
      existing_follow = Follow.get_existing_follow(context[:current_user].id, object.id)
      if_visible_to_user = User.if_visible_to_user(context[:current_user].id, object.id, existing_follow&.status)
      if if_visible_to_user
        return object.review_likes
      else
        return []
      end
    end
      
    


    # return the url of the profile picture
    def profile_picture
      object.presigned_profile_picture_url
    end
  end
end

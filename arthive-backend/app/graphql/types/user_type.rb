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

    def followers_count
      object.followers_count(object.id)
    end
    def following_count
      object.following_count(object.id)
    end
    


    # return the url of the profile picture
    def profile_picture
      object.presigned_profile_picture_url
    end
  end
end

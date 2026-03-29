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

    # return the url of the profile picture
    def profile_picture
      object.presigned_profile_picture_url
    end
  end
end

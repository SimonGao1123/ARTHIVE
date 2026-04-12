# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :login, mutation: Mutations::Login
    field :create_user, mutation: Mutations::CreateUser

    # ALSO USED FOR UPDATING REVIEW
    field :create_review, mutation: Mutations::CreateReview
    field :like_review, mutation: Mutations::LikeReview
    field :comment_on_review, mutation: Mutations::CommentOnReview

    field :send_follow, mutation: Mutations::SendFollow
    field :manipulate_follow, mutation: Mutations::ManipulateFollow
  end
end

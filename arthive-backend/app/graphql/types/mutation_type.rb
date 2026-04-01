# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :login, mutation: Mutations::Login
    field :create_user, mutation: Mutations::CreateUser

    # ALSO USED FOR UPDATING REVIEW
    field :create_review, mutation: Mutations::CreateReview
    
  end
end

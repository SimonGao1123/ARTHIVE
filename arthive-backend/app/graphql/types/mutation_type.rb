# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :login, mutation: Mutations::Login
    field :create_user, mutation: Mutations::CreateUser

    
  end
end

# frozen_string_literal: true

module Mutations
  class CreateUser < BaseMutation
    type Types::UserType
    argument :email, String, required: true
    argument :username, String, required: true
    argument :password, String, required: true

    def resolve(email:, username:, password:)
      user = User.new(email: email, username: username, password: password, if_admin: false)
      if user.save
        user
      else
        raise GraphQL::ExecutionError, user.errors.full_messages.join(", ")
      end
    end
  end
end

# frozen_string_literal: true

module Mutations
  class Login < BaseMutation
    field :token, String, null: true
    field :user, Types::UserType, null: true

    argument :email, String, required: true
    argument :password, String, required: true

    def resolve(email:, password:)
      user = User.find_by(email: email)
      if user.present? && user.authenticate(password)
        { token: JsonWebToken.encode({ user_id: user.id }), user: user }
      else
        raise GraphQL::ExecutionError, "Password or email is incorrect"
      end
    end
  end
end

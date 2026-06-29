# frozen_string_literal: true

module Mutations
  class Login < BaseMutation
    field :user, Types::UserType, null: true

    argument :email, String, required: true
    argument :password, String, required: true

    def resolve(email:, password:)
      user = User.find_by(email: email)
      if user.present? && user.authenticate(password)
        jwt = JsonWebToken.encode({ user_id: user.id, token_version: user.token_version })

        raw_refresh = RefreshToken.generate_raw

        RefreshToken.create!(
          user: user,
          token_digest: RefreshToken.digest_for(raw_refresh),
          expires_at: 30.days.from_now,
        )

        context[:set_refresh_cookie] = raw_refresh

        # Defer the actual cookie write to the controller — it owns the response.
        # Writing through context[:request].cookie_jar from a resolver doesn't
        # always reach the response in graphql-ruby + Rails.
        context[:set_auth_cookie] = jwt

        { user: user }
      else
        raise GraphQL::ExecutionError, "Password or email is incorrect"
      end
    end
  end
end

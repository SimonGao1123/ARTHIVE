# frozen_string_literal: true

module Resolvers
  class WhoamiResolver < GraphQL::Schema::Resolver
    type Types::UserType, null: false

    def resolve
      auth = context[:auth_error]
      if auth.in?(%w[EXPIRED_TOKEN INVALID_TOKEN NO_TOKEN USER_NOT_FOUND]) || context[:current_user].blank?
        raise GraphQL::ExecutionError, auth
      end

      context[:current_user]
    end
  end
end

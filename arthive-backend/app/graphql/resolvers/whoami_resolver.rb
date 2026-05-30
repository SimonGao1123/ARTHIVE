# frozen_string_literal: true

module Resolvers
  class WhoamiResolver < BaseResolver
    type Types::UserType, null: false

    def resolve
      validate_user

      context[:current_user]
    end
  end
end

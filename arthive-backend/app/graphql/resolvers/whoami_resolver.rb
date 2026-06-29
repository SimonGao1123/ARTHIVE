# frozen_string_literal: true

module Resolvers
  class WhoamiResolver < BaseResolver
    type Types::UserType, null: true

    def resolve
      context[:current_user]
    end
  end
end

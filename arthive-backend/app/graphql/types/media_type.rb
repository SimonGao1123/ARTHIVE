# frozen_string_literal: true

module Types
  class MediaType < Types::BaseObject
    field :id, ID, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :title, String, null: false
    field :creator, String, null: false
    field :year, String, null: false
    field :content_type, String, null: false
    field :language, String, null: false
    field :summary, String, null: false
    field :genre, [String], null: false
    field :ongoing, Boolean, null: false

    field :actors, [String], null: true
    field :page_count, Int, null: true
    field :series_title, String, null: true
    field :organization, String, null: true

    field :cover_image, String, null: false

    # return the url of the cover image
    def cover_image
      if object.cover_image.attached?
        req = context[:request]
        host = req&.base_url
        Rails.application.routes.url_helpers.rails_blob_url(object.cover_image, host: host)
      else
        nil
      end
    end
  end
end

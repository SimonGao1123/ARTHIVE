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

    field :cover_image, String, null: true

    field :added_by, Types::UserType, null: false

    field :in_lists, [Types::ListType], null: false

    # return the url of the cover image
    def cover_image
      object.presigned_cover_image_url
    end

    def added_by
      object.user
    end

    # returns all the lists from the current user that the media is in
    # this is used to display the lists that the media is in on the media details page (for quick removal)
    def in_lists
      List.joins(:media_in_lists)
          .where(media_in_lists: { media_id: object.id })
          .where(user_id: context[:current_user].id)
    end
  end
end

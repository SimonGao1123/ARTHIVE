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

    field :community, Types::CommunityType, null: false

    field :reviews_ai_summary, String, null: true

    field :if_favorite, Boolean, null: false
    field :if_finished, Boolean, null: false
    field :review_count, Int, null: false

    field :favorite_count, Int, null: false
    field :average_rating, Float, null: false

    def favorite_count
      if object.reviews.loaded?
        object.reviews.count(&:if_favorite)
      else
        object.reviews.where(if_favorite: true).count
      end
    end

    def average_rating
      if object.reviews.loaded?
        rated = object.reviews.reject { |r| r.rating.nil? }
        return 0 if rated.empty?
        (rated.sum(&:rating).to_f / rated.size).round(1)
      else
        object.reviews.where.not(rating: nil).average(:rating)&.round(1) || 0
      end
    end

    def if_favorite
      return false unless context[:current_user]
      if object.reviews.loaded?
        object.reviews.any? { |r| r.user_id == context[:current_user].id && r.if_favorite }
      else
        object.reviews.exists?(user_id: context[:current_user].id, if_favorite: true)
      end
    end

    def if_finished
      return false unless context[:current_user]
      if object.reviews.loaded?
        object.reviews.any? { |r| r.user_id == context[:current_user].id && r.if_finished }
      else
        object.reviews.exists?(user_id: context[:current_user].id, if_finished: true)
      end
    end

    def review_count
      object.reviews_count
    end
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
      return [] unless context[:current_user]
      List.joins(:media_in_lists)
          .where(media_in_lists: { media_id: object.id })
          .where(user_id: context[:current_user].id)
    end
  end
end

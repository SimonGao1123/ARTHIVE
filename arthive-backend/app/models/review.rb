class Review < ApplicationRecord
    include SharedScopeMethods
    belongs_to :user
    belongs_to :media

    has_many :review_comments, dependent: :delete_all
    has_many :review_likes, dependent: :delete_all

    validates :content, length: { maximum: 5000 }
    validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
    validates :if_favorite, inclusion: { in: [true, false] }
    validates :if_finished, inclusion: { in: [true, false] }

    # guarentees that a review is unique for a user and a media
    validates :user_id, uniqueness: { scope: :media_id }
    
    def self.retrieve_review(user_id, media_id)
        review = find_by(user_id: user_id, media_id: media_id)
        if review.present?
            return review
        else
            return nil
        end
    end

    scope :sort_by_likes, -> {
        left_joins(:review_likes)
        .select("reviews.*, COUNT(review_likes.id) AS likes_count")
        .group("reviews.id")
        .order(Arel.sql("likes_count DESC"))
    }

    # updates review if review_id is provided, otherwise creates a new review
    def self.update_review(user_id, media_id, content, rating, if_favorite, if_finished, review_id)
        if review_id.present?
            review = includes(:review_comments, :review_likes).find_by(id: review_id, user_id: user_id, media_id: media_id)
            if review.present?
                # if content is removed, delete all comments and likes
                if content.blank?
                    review.review_comments.delete_all
                    review.review_likes.delete_all
                end

                if content.blank? && rating.blank? && !if_favorite && !if_finished
                    review.destroy!
                    return nil
                end

                review.update!(content: content, rating: rating, if_favorite: if_favorite, if_finished: if_finished)
                return review
            else
                raise ActiveRecord::RecordNotFound, "Review not found with the given ID, user ID, and media ID"
            end
        else
            new_review = new(
                user_id: user_id, 
                media_id: media_id, 
                content: content, 
                rating: rating, 
                if_favorite: if_favorite, 
                if_finished: if_finished
            )
            if new_review.save
                return new_review
            else
                raise ActiveRecord::RecordInvalid.new(new_review)
            end
        end
    end         

    scope :query_filter, ->(query) {
        if query.present?
            where("content ILIKE ?", "%#{query}%")
        end
    }
    scope :content_type_filter, ->(content_type) {
        where(media: {content_type: content_type})
    }
    scope :genre_filter, ->(genre) {
        where(media_id: Media.genre_filter(genre).select(:id))
    }

    def self.search(query:, search_filter:)
        base_search = Review.query_filter(query).where.not(content: nil)
        
        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.content_type_filter(normalized_values)
                    when "genre"
                        base_search = base_search.genre_filter(normalized_values)
                end
            end
        end

        return base_search.includes(:user, :media).recent
    end
end

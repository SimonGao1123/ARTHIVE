class Review < ApplicationRecord
    include SharedScopeMethods
    belongs_to :user
    belongs_to :media

    has_many :review_comments
    has_many :review_likes

    validates :content, length: { maximum: 5000 }
    validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
    validates :if_favorite, inclusion: { in: [true, false] }
    validates :if_finished, inclusion: { in: [true, false] }

    # guarentees that a review is unique for a user and a media
    validates :user_id, uniqueness: { scope: :media_id }
    
    def self.retrieve_review(user_id, media_id)
        review = includes(:review_comments, :review_likes).find_by(user_id: user_id, media_id: media_id)
        if review.present?
            return review
        else
            return nil
        end
    end

    def self.retrieve_review_page(review_id, page_num, limit, user_id)
        review = includes(:review_comments, :review_likes, :user, :media).find_by(id: review_id)
        if review.present?
            {
                review: review,
                review_comments: review.review_comments.page(page_num, limit).in_order_of(:user_id, [user_id]),
                review_likes: review.review_likes
            }
        else
            return nil
        end
    end
    # updates review if review_id is provided, otherwise creates a new review
    def self.update_review(user_id, media_id, content, rating, if_favorite, if_finished, review_id)
        if review_id.present?
            review = includes(:review_comments, :review_likes).find_by(id: review_id, user_id: user_id, media_id: media_id)
            if review.present?
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
end

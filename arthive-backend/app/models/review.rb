class Review < ApplicationRecord
    belongs_to :user
    belongs_to :media

    validates :content, length: { maximum: 5000 }
    validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
    validates :if_favorite, inclusion: { in: [true, false] }
    validates :if_finished, inclusion: { in: [true, false] }

    # guarentees that a review is unique for a user and a media
    validates :user_id, uniqueness: { scope: :media_id }


    
    # updates review if review_id is provided, otherwise creates a new review
    def self.update_review(user_id, media_id, content, rating, if_favorite, if_finished, review_id)
        if review_id.present?
            review = Review.find_by(id: review_id, user_id: user_id, media_id: media_id)
            if review.present?
                review.update!(content: content, rating: rating, if_favorite: if_favorite, if_finished: if_finished)
                return review
            else
                raise ActiveRecord::RecordNotFound, "Review not found with the given ID, user ID, and media ID"
            end
        else
            new_review = Review.new(
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

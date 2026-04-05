class ReviewLike < ApplicationRecord
    belongs_to :review
    belongs_to :user

    validates :review_id, presence: true
    validates :user_id, presence: true
    validates :review_id, uniqueness: { scope: :user_id }
end

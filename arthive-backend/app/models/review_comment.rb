class ReviewComment < ApplicationRecord
    include SharedScopeMethods
    belongs_to :review
    belongs_to :user

    validates :comment, presence: true
    validates :review_id, presence: true
    validates :user_id, presence: true

    scope :query_filter, ->(query) {
        if query.present?
            where("comment ILIKE ?", "%#{query}%")
        end
    }
end

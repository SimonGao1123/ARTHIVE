class ReviewComment < ApplicationRecord
    include SharedScopeMethods
    belongs_to :review, counter_cache: true
    belongs_to :user

    validates :comment, presence: true
    validates :review_id, presence: true
    validates :user_id, presence: true

    has_many :activities, -> { where(activity_type: "ReviewComment") }, foreign_key: :activity_id, dependent: :delete_all
    has_many :notifications, dependent: :delete_all

    scope :query_filter, ->(query) {
        if query.present?
            where("comment ILIKE ?", "%#{query}%")
        end
    }
end

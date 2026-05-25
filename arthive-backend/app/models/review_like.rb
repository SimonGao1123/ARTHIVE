class ReviewLike < ApplicationRecord
    belongs_to :review
    belongs_to :user

    validates :review_id, presence: true
    validates :user_id, presence: true
    validates :review_id, uniqueness: { scope: :user_id }

    has_many :activities, -> { where(activity_type: "ReviewLike") }, foreign_key: :activity_id, dependent: :delete_all

    def self.toggle_like(user_id, review_id)
        like = find_by(user_id: user_id, review_id: review_id)

        # if like is present, destroy it (unlike), else create it (like)
        if like.present?
            like.destroy
            return false
        else
            create!(user_id: user_id, review_id: review_id)
            return true
        end
    end
end

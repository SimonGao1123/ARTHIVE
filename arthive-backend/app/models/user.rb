class User < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods
    has_many :reviews
    has_secure_password
    validates :email, presence: true, uniqueness: true
    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 8 }

    # Do not use `presence: true` on booleans — in Rails, `false.blank?` is true,
    # so presence validation rejects legitimate `false` values.
    validates :if_admin, inclusion: { in: [true, false] }

    has_one_attached :profile_picture

    has_many :media, class_name: "Media"

    def presigned_profile_picture_url
        PresignedUrlAttachment.presigned_url(profile_picture)
    end

    # instance method, TODO: optimize preloading of reviews when implementing likes and comments
    def all_user_reviews(page_num = 1, limit = 10)
        begin
            reviews = self.reviews.includes(:media).recent.page(page_num, limit)
            return reviews.to_a # returns a paginated list of reviews
        rescue ActiveRecord::RecordNotFound
            return [] # returns an empty array if no reviews are found
        end
    end

end

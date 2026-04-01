class User < ApplicationRecord
    include PresignedUrlAttachment
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
end

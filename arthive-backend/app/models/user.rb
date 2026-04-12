class User < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods
    has_many :reviews
    has_many :review_comments
    has_many :review_likes

    has_many :sent_follows, class_name: "Follow", foreign_key: "sender_id"
    has_many :received_follows, class_name: "Follow", foreign_key: "receiver_id"

    has_secure_password
    validates :email, presence: true, uniqueness: true
    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 8 }
    
    validates :visibility, inclusion: { in: ["public", "private"] }
    validates :visibility, presence: true

    # Do not use `presence: true` on booleans — in Rails, `false.blank?` is true,
    # so presence validation rejects legitimate `false` values.
    validates :if_admin, inclusion: { in: [true, false] }

    has_one_attached :profile_picture

    has_many :media, class_name: "Media"

    def presigned_profile_picture_url
        PresignedUrlAttachment.presigned_url(profile_picture)
    end
    
    def content_type_reviews(content_type)
        if content_type == "all"
            self.reviews.includes(:review_comments, :review_likes)
        else
            self.reviews.includes(:review_comments, :review_likes).where(media: { content_type: content_type })
        end
    end
    def all_user_reviews(content_type, page_num, limit)
        begin
            reviews = self.content_type_reviews(content_type).includes(:media).recent.page(page_num, limit)
            return reviews.to_a # returns a paginated list of reviews
        rescue ActiveRecord::RecordNotFound
            return [] # returns an empty array if no reviews are found
        end
    end

    def self.followers_count(user_id)
        Follow.where(receiver_id: user_id, status: Follow::STATUSES[:accepted]).count
    end

    def self.following_count(user_id)
        Follow.where(sender_id: user_id, status: Follow::STATUSES[:accepted]).count
    end

    def self.pending_sent_follows_count(user_id)
        Follow.where(sender_id: user_id, status: Follow::STATUSES[:pending]).count
    end
    def self.pending_received_follows_count(user_id)
        Follow.where(receiver_id: user_id, status: Follow::STATUSES[:pending]).count
    end


    def self.get_followers(user_id, page_num, limit)
        Follow.where(receiver_id: user_id, status: Follow::STATUSES[:accepted]).includes(:sender).page(page_num, limit).recent
    end
    def self.get_following(user_id, page_num, limit)
        Follow.where(sender_id: user_id, status: Follow::STATUSES[:accepted]).includes(:receiver).page(page_num, limit).recent
    end

    def self.get_pending_sent_follows(user_id, page_num, limit)
        Follow.where(sender_id: user_id, status: Follow::STATUSES[:pending]).includes(:receiver).page(page_num, limit).recent
    end
    def self.get_pending_received_follows(user_id, page_num, limit)
        Follow.where(receiver_id: user_id, status: Follow::STATUSES[:pending]).includes(:sender).page(page_num, limit).recent
    end


    def self.obtain_follower_info(user_id, page_num, limit, type)
        case type
        when "followers"
            {
                follows: get_followers(user_id, page_num, limit),
                count: followers_count(user_id)
            }
        when "following"
            {
                follows: get_following(user_id, page_num, limit),
                count: following_count(user_id)
            }
        when "pending_sent_follows"
            {
                follows: get_pending_sent_follows(user_id, page_num, limit),
                count: pending_sent_follows_count(user_id)
            }
        when "pending_received_follows"
            {
                follows: get_pending_received_follows(user_id, page_num, limit),
                count: pending_received_follows_count(user_id)
            }
        else
            raise GraphQL::ExecutionError, "Invalid follow type"
        end
    end

end

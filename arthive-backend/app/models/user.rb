class User < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods
    has_many :reviews
    has_many :review_comments
    has_many :review_likes
    has_many :lists, dependent: :destroy

    has_many :sent_follows, class_name: "Follow", foreign_key: "sender_id"
    has_many :received_follows, class_name: "Follow", foreign_key: "receiver_id"

    has_secure_password
    validates :email, presence: true, uniqueness: true
    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 8 }, allow_nil: true
    
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

    
    def followers_count
        self.received_follows.where(status: Follow::STATUSES[:accepted]).count
    end

    def following_count
        self.sent_follows.where(status: Follow::STATUSES[:accepted]).count
    end

    def pending_sent_follows_count
        self.sent_follows.where(status: Follow::STATUSES[:pending]).count
    end
    def pending_received_follows_count
        self.received_follows.where(status: Follow::STATUSES[:pending]).count
    end


    def get_followers(page_num, limit)
        self.received_follows.where(status: Follow::STATUSES[:accepted]).includes(:sender).page(page_num, limit).recent
    end
    def get_following(page_num, limit)
        self.sent_follows.where(status: Follow::STATUSES[:accepted]).includes(:receiver).page(page_num, limit).recent
    end

    def get_pending_sent_follows(page_num, limit)
        self.sent_follows.where(status: Follow::STATUSES[:pending]).includes(:receiver).page(page_num, limit).recent
    end
    def get_pending_received_follows(page_num, limit)
        self.received_follows.where(status: Follow::STATUSES[:pending]).includes(:sender).page(page_num, limit).recent
    end


    # for specific follwer pages
    def self.obtain_follower_info(current_user_id, user_id, page_num, limit, type)

        user = User.find_by(id: user_id)
        if user.nil?
            raise GraphQL::ExecutionError, "User not found"
        end

        if !User.if_visible_to_user(current_user_id, user_id)
            raise GraphQL::ExecutionError, "You are not allowed to view this user's followers"
        end

        case type
        when "followers"
            {
                user: user,
                follows: user.get_followers(page_num, limit),
                count: user.followers_count
            }
        when "following"
            {
                user: user,
                follows: user.get_following(page_num, limit),
                count: user.following_count
            }
        when "pending_sent_follows"
            if current_user_id.to_i != user_id.to_i
                raise GraphQL::ExecutionError, "You are not the user"
            end
            {
                user: user,
                follows: user.get_pending_sent_follows(page_num, limit),
                count: user.pending_sent_follows_count
            }
        when "pending_received_follows"
            if current_user_id.to_i != user_id.to_i
                raise GraphQL::ExecutionError, "You are not the user"
            end
            {
                user: user,
                follows: user.get_pending_received_follows(page_num, limit),
                count: user.pending_received_follows_count
            }
        else
            raise GraphQL::ExecutionError, "Invalid follow type"
        end
    end

    def get_finished_count(content_type)
        if content_type == "all"
            self.reviews.where(if_finished: true).count
        else
            self.reviews.joins(:media).where(media: { content_type: content_type }, if_finished: true).count
        end
    end

    def self.if_visible_to_user(user_id, target_user_id)
        target_user = User.find_by(id: target_user_id)
        if target_user.nil?
            raise GraphQL::ExecutionError, "User not found"
        end

        follower_status = Follow.find_by(sender_id: user_id, receiver_id: target_user_id)

        if user_id.to_i == target_user_id.to_i || (follower_status.present? && follower_status.status == Follow::STATUSES[:accepted]) || target_user.visibility == "public"
            return true
        else
            return false
        end
    end

    def self.obtain_user_profile(target_user_id, current_user_id)
        user = User.find_by(id: target_user_id)
        if user.nil?
            raise GraphQL::ExecutionError, "User not found"
        end

        outgoing_follow = Follow.where(sender_id: current_user_id, receiver_id: target_user_id).where.not(status: Follow::STATUSES[:rejected]).first unless current_user_id == target_user_id
        incoming_follow = Follow.where(sender_id: target_user_id, receiver_id: current_user_id).where.not(status: Follow::STATUSES[:rejected]).first unless current_user_id == target_user_id
        
        is_visible = if_visible_to_user(current_user_id, target_user_id)


        total_reviews_count = is_visible ? user.reviews.where.not(content: nil).count : nil
        all_finished_count = is_visible ? user.get_finished_count("all") : nil
        film_finished_count = is_visible ? user.get_finished_count("film") : nil
        series_finished_count = is_visible ? user.get_finished_count("series") : nil
        book_finished_count = is_visible ? user.get_finished_count("book") : nil
        game_finished_count = is_visible ? user.get_finished_count("game") : nil
        return {
            user: user,
            current_outgoing_follow: outgoing_follow,
            current_incoming_follow: incoming_follow,
            is_visible_to_user: is_visible,

            total_reviews_count: total_reviews_count,
            all_finished_count: all_finished_count,
            film_finished_count: film_finished_count,
            series_finished_count: series_finished_count,
            book_finished_count: book_finished_count,
            game_finished_count: game_finished_count,
        }
    end
end

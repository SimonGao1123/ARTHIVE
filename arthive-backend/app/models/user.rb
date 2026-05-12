class User < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods
    has_many :reviews
    has_many :review_comments
    has_many :review_likes
    has_many :lists, dependent: :destroy
    has_many :community_threads, dependent: :destroy
    has_many :thread_likes, dependent: :destroy

    has_many :sent_follows, class_name: "Follow", foreign_key: "sender_id"
    has_many :received_follows, class_name: "Follow", foreign_key: "receiver_id"

    has_secure_password
    validates :email, presence: true, uniqueness: true
    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 8 }, allow_nil: true
    validates :description, length: { maximum: 280 }

    
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
    
    def content_type_lists(content_type)
        if content_type == "all"
            self.lists.includes(media_in_lists: :media)
        else
            self.lists.where("content_type @> ARRAY[?]::varchar[]", [content_type]).includes(media_in_lists: :media)
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


    def get_followers()
        self.received_follows.where(status: Follow::STATUSES[:accepted]).includes(:sender)
    end
    def get_following()
        self.sent_follows.where(status: Follow::STATUSES[:accepted]).includes(:receiver)
    end

    def get_pending_sent_follows()
        self.sent_follows.where(status: Follow::STATUSES[:pending]).includes(:receiver)
    end
    def get_pending_received_follows()
        self.received_follows.where(status: Follow::STATUSES[:pending]).includes(:sender)
    end
    


    # for specific follwer pages
    def self.obtain_follower_info(current_user_id, user, type, query)

        if !User.if_visible_to_user(current_user_id, user.id)
            raise GraphQL::ExecutionError, "You are not allowed to view this user's followers"
        end

        follows = []
        count = 0
        case type
        when "followers"
            follows = user.get_followers
            count = user.followers_count
        when "following"
            follows = user.get_following
            count = user.following_count
        when "pending_sent_follows"
            if current_user_id.to_i != user.id.to_i
                raise GraphQL::ExecutionError, "You are not the user"
            end
            follows = user.get_pending_sent_follows
            count = user.pending_sent_follows_count
        when "pending_received_follows"
            if current_user_id.to_i != user.id.to_i
                raise GraphQL::ExecutionError, "You are not the user"
            end
            follows = user.get_pending_received_follows
            count = user.pending_received_follows_count
        else
            raise GraphQL::ExecutionError, "Invalid follow type"
        end

        follows = follows.query_filter(query).recent

        return {
            follows: follows,
            count: count
        }
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

    scope :query_filter, -> (query) {   
        where('username ILIKE ?', "%#{query}%")
    }
    def self.search(query:, current_user_id:)
        base_search = User.query_filter(query)

        base_search = base_search.filter { |user| User.if_visible_to_user(current_user_id, user.id)}

        return base_search
    end
end

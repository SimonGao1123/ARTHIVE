class Follow < ApplicationRecord

    include SharedScopeMethods
    STATUSES = {
        accepted: "accepted",
        pending: "pending",
        rejected: "rejected"
    }.freeze
    belongs_to :sender, class_name: "User"
    belongs_to :receiver, class_name: "User"

    has_many :notifications, dependent: :delete_all

    enum :status, { accepted: "accepted", pending: "pending", rejected: "rejected" }, prefix: true

    validates :status, presence: true
    validates :sender_id, presence: true
    validates :receiver_id, presence: true

    validates :sender_id, uniqueness: { scope: :receiver_id }

    validate :sender_receiver_uniqueness

    # users.followers_count / users.following_count track only accepted follows.
    # Stock counter_cache would count rejected/pending too — manage manually.
    after_create  :increment_user_follow_counts_if_accepted
    after_update  :sync_user_follow_counts_on_status_change
    after_destroy :decrement_user_follow_counts_if_accepted

    private
    def sender_receiver_uniqueness
        if self.sender_id == self.receiver_id
            errors.add(:base, "You cannot follow yourself")
        end
    end

    def increment_user_follow_counts_if_accepted
        return unless status == STATUSES[:accepted]
        User.increment_counter(:followers_count, receiver_id)
        User.increment_counter(:following_count, sender_id)
    end

    def sync_user_follow_counts_on_status_change
        return unless saved_change_to_status?
        was_accepted = saved_change_to_status.first == STATUSES[:accepted]
        is_accepted  = saved_change_to_status.last  == STATUSES[:accepted]
        return if was_accepted == is_accepted
        if is_accepted
            User.increment_counter(:followers_count, receiver_id)
            User.increment_counter(:following_count, sender_id)
        else
            User.decrement_counter(:followers_count, receiver_id)
            User.decrement_counter(:following_count, sender_id)
        end
    end

    def decrement_user_follow_counts_if_accepted
        return unless status == STATUSES[:accepted]
        User.decrement_counter(:followers_count, receiver_id)
        User.decrement_counter(:following_count, sender_id)
    end


    public
    def self.send_follow(sender_id, receiver_id)

        begin
            if sender_id == receiver_id
                raise GraphQL::ExecutionError, "You cannot follow yourself"
            end

            existing_follow = Follow.find_by(sender_id: sender_id, receiver_id: receiver_id)
            if existing_follow.present? && existing_follow.status != STATUSES[:rejected]
                raise GraphQL::ExecutionError, "You are already following this user"
            end

            receiver = User.find_by(id: receiver_id)
            if receiver.blank?
                raise GraphQL::ExecutionError, "User not found"
            end

            visibility = receiver.visibility
            
            if existing_follow.present? && existing_follow.status == STATUSES[:rejected]
                existing_follow.update!(status: visibility == "public" ? STATUSES[:accepted] : STATUSES[:pending])
                return existing_follow
            end

            create!(sender_id: sender_id, receiver_id: receiver_id, status: visibility == "public" ? STATUSES[:accepted] : STATUSES[:pending])
        rescue ActiveRecord::RecordInvalid => e
            raise GraphQL::ExecutionError, e.message
        end
    end


    # all grouped methods 
    def accept_or_reject_follow(user_id, accept_or_reject)
        if self.receiver_id != user_id
            raise GraphQL::ExecutionError, "You are not the receiver of this follow"
        end

        if self.status != STATUSES[:pending]
            raise GraphQL::ExecutionError, "This follow is not pending"
        end

        self.update!(status: accept_or_reject ? STATUSES[:accepted] : STATUSES[:rejected])
    end

    def unfollow(user_id)
        if (self.sender_id != user_id && self.receiver_id != user_id) || self.status != STATUSES[:accepted]
            raise GraphQL::ExecutionError, "You are not the sender or receiver of this follow or this follow is not accepted"
        end

        self.update!(status: STATUSES[:rejected])
        List.normalize_likes_saves_for_owner(self.receiver_id)
    end

    def cancel_follow(user_id)
        if self.sender_id != user_id || self.status != STATUSES[:pending]
            raise GraphQL::ExecutionError, "You are not the sender of this follow or this follow is not pending"
        end

        self.update!(status: STATUSES[:rejected])
    end
    
    scope :query_filter, ->(query) {
        if query.present?
            joins("INNER JOIN users AS sender ON sender.id = follows.sender_id")
            .joins("INNER JOIN users AS receiver ON receiver.id = follows.receiver_id")
            .where("sender.username ILIKE ? OR receiver.username ILIKE ?", "%#{query}%", "%#{query}%")
        end
    }

    
    def self.manipulate_follow(user_id, follow, manipulation)

        case manipulation
        when "accept"
            follow.accept_or_reject_follow(user_id, true)
        when "reject"
            follow.accept_or_reject_follow(user_id, false)
        when "unfollow"
            follow.unfollow(user_id)
        when "cancel"
            follow.cancel_follow(user_id)
        else
            raise GraphQL::ExecutionError, "Invalid manipulation"
        end

        return follow
    end

end

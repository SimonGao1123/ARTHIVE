class Notification < ApplicationRecord
    include SharedScopeMethods

    ACTIONS = {
        follows: ["followed", "follow_request", "follow_request_accepted", "follow_request_rejected"],

        reviews: ["comment_on_review", "like_on_review"],

        threads: ["comment_on_thread", "like_on_thread"],

        quote_reviews: ["review_quoted"],

        lists: ["like_on_list", "save_on_list"],

        list_members: ["invite_to_list", "list_invite_accepted"],
    }.freeze
    belongs_to :receiver, class_name: "User"
    belongs_to :sender, class_name: "User"

    validates :action, presence: true



    belongs_to :review_comment, optional: true
    belongs_to :review, optional: true
    belongs_to :parent_thread, class_name: "CommunityThread", optional: true
    belongs_to :comment_thread, class_name: "CommunityThread", optional: true
    belongs_to :follow, optional: true
    belongs_to :list, optional: true
    belongs_to :list_member, optional: true


    validates :message_id, uniqueness: true

    validate :validate_receiver_sender_uniqueness
    validate :validate_action_with_correct_fields

    private
    def validate_receiver_sender_uniqueness
        if self.receiver_id == self.sender_id
            errors.add(:base, "You cannot send a notification to yourself")
        end
    end

    def validate_action_with_correct_fields
        # first validate action is within ACTIONS
        if !ACTIONS.values.flatten.include?(self.action)
            errors.add(:base, "Invalid action")
        end

        # then validate action with correct fields
        if ACTIONS[:follows].include?(self.action)
            if self.follow.blank?
                errors.add(:base, "Follow is required for this action")
            end
        end


        if ACTIONS[:reviews].include?(self.action)
            if self.review.blank?
                errors.add(:base, "Review is required for this action")
            end
            if action == "comment_on_review" && self.review_comment.blank?
                errors.add(:base, "Review comment is required for this action")
            end
        end


        if ACTIONS[:threads].include?(self.action)
            if self.parent_thread.blank?
                errors.add(:base, "Parent thread is required for this action")
            end
            if action == "comment_on_thread" && self.comment_thread.blank?
                errors.add(:base, "Comment thread is required for this action")
            end
        end


        if ACTIONS[:quote_reviews].include?(self.action)
            if self.review.blank? || self.parent_thread.blank?
                errors.add(:base, "Review and parent thread are required for this action")
            end
        end

        if ACTIONS[:lists].include?(self.action)
            if self.list.blank?
                errors.add(:base, "List is required for this action")
            end
        end

        if ACTIONS[:list_members].include?(self.action)
            if self.list_member.blank?
                errors.add(:base, "List member is required for this action")
            end
        end
    end
    public

    def self.cleanup_old_records
        where("created_at < ? AND read_at IS NULL", 1.month.ago).destroy_all
    end
end

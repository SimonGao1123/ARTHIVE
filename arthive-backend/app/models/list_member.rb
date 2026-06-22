class ListMember < ApplicationRecord
    belongs_to :list
    belongs_to :user
    belongs_to :sent_by_user, class_name: "User", optional: true
    enum :status, { pending: "pending", accepted: "accepted", rejected: "rejected" }, prefix: true
    enum :role, { member: "member", admin: "admin" }, prefix: true

    validate :user_not_owner
    validate :joined_at_date

    has_many :notifications, dependent: :delete_all

    private
    def user_not_owner
        return unless list.present?
        if self.list.user_id == self.user_id
            errors.add(:base, "Owner cannot be a member of their own list")
        end
    end
    def joined_at_date
        if self.joined_at.present? && self.joined_at > Time.now
            errors.add(:base, "Joined at date cannot be in the future")
        end
    end
    public

    def self.invite_user_to_list(list, user, role, sender)

        if list.user_id == user.id
            raise GraphQL::ExecutionError, "You cannot invite yourself to your own list"
        end

        if sender.id == user.id
            raise GraphQL::ExecutionError, "You cannot invite yourself to your own list"
        end

        existing_list_member = ListMember.find_by(list: list, user: user)


        if existing_list_member.present?

            if existing_list_member.status != "rejected"
                raise GraphQL::ExecutionError, "User is already a member/pending member of this list"
            end

            existing_list_member.update!(role: role, status: "pending", sent_by_user: sender)
            list_member = existing_list_member
        else
            list_member = create!(list: list, user: user, role: role, status: "pending", sent_by_user: sender)
        end

        SQS_CLIENT.send_message(
            queue_url: SQS_QUEUE_URL,
            message_body: {
                type: "notification",
                action: "invite_to_list",
                sender_id: sender.id,
                receiver_id: user.id,
                list_member_id: list_member.id,
            }.to_json
        )

        return list_member
    end

    def respond_to_invite(accept)
        if self.status != "pending"
            raise GraphQL::ExecutionError, "This invite is not pending"
        end

        self.update!(status: accept ? "accepted" : "rejected", joined_at: accept ? Time.now : nil)
        return self
    end

end

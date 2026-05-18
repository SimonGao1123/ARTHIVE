class Activity < ApplicationRecord
    include SharedScopeMethods

    VALID_SUBJECT_TYPES = %w[Review ReviewComment ReviewLike CommunityThread ThreadLike List MediaInList].freeze
    VALID_STATUSES = %w[created updated inactive].freeze

    belongs_to :user
    belongs_to :subject, polymorphic: true, foreign_key: :activity_id, foreign_type: :activity_type

    validates :activity_type, inclusion: { in: VALID_SUBJECT_TYPES }
    validates :status, inclusion: { in: VALID_STATUSES }

    def self.log(user:, subject:, status:)
        create!(user: user, subject: subject, status: status)
    end
    def self.destroy(user:, subject:)
        activity = find_by(user: user, subject: subject)
        if activity.present?
            activity.update(status: "inactive")
        end
    end
end

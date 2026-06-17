class Activity < ApplicationRecord
    include SharedScopeMethods

    VALID_SUBJECT_TYPES = %w[Review ReviewComment ReviewLike CommunityThread ThreadLike List MediaInList].freeze
    # if destroyed just delete the row
    VALID_STATUSES = %w[created updated].freeze


    belongs_to :user
    belongs_to :subject, polymorphic: true, foreign_key: :activity_id, foreign_type: :activity_type

    validates :activity_type, inclusion: { in: VALID_SUBJECT_TYPES }
    validates :status, inclusion: { in: VALID_STATUSES }

    def self.log(user:, subject:, status:, snapshot: nil)
        create!(user: user, subject: subject, status: status, activity_snapshot: snapshot)
    end

end

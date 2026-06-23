class Activity < ApplicationRecord
    include SharedScopeMethods

    VALID_SUBJECT_TYPES = %w[Review ReviewComment ReviewLike CommunityThread ThreadLike List MediaInList ListLike].freeze
    # if destroyed just delete the row
    VALID_STATUSES = %w[created updated].freeze


    belongs_to :user
    belongs_to :subject, polymorphic: true, foreign_key: :activity_id, foreign_type: :activity_type

    validates :activity_type, inclusion: { in: VALID_SUBJECT_TYPES }
    validates :status, inclusion: { in: VALID_STATUSES }

    def self.log(user:, subject:, status:, snapshot: nil)
        create!(user: user, subject: subject, status: status, activity_snapshot: snapshot)
    end

    # Delete activity rows whose created_at is older than `older_than` ago.
    # Used by the daily scheduler tick; `older_than:` is parameterized so tests
    # can pass shorter windows without time-travel.
    def self.cleanup_old_records(older_than: 1.week)
        where("created_at < ?", older_than.ago).delete_all
    end

end

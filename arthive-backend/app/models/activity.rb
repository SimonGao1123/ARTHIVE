class Activity < ApplicationRecord
    include SharedScopeMethods

    VALID_SUBJECT_TYPES = %w[Review ReviewComment ReviewLike CommunityThread ThreadLike List MediaInList ListLike ListSave].freeze
    # if destroyed just delete the row
    VALID_STATUSES = %w[created updated].freeze

    # Maps each `ActivityFilterEnum` value → the `activity_type` strings that
    # roll up into that bucket. Used by the `.for_filter` scope below. The union
    # of all group values covers `VALID_SUBJECT_TYPES` exactly (no overlaps).
    FILTER_GROUPS = {
        "reviews"  => %w[Review].freeze,
        "likes"    => %w[ReviewLike ListLike ThreadLike].freeze,
        "comments" => %w[ReviewComment].freeze,
        "threads"  => %w[CommunityThread].freeze,
        "lists"    => %w[List MediaInList ListSave].freeze,
    }.freeze


    belongs_to :user
    belongs_to :subject, polymorphic: true, foreign_key: :activity_id, foreign_type: :activity_type

    validates :activity_type, inclusion: { in: VALID_SUBJECT_TYPES }
    validates :status, inclusion: { in: VALID_STATUSES }

    # Narrow by filter bucket. Unknown / blank / "all" is a no-op so callers
    # can chain unconditionally.
    scope :for_filter, ->(filter) {
        return all if filter.blank? || filter.to_s == "all"
        types = FILTER_GROUPS[filter.to_s]
        types ? where(activity_type: types) : all
    }

    def self.log(user:, subject:, status:, snapshot: nil)
        create!(user: user, subject: subject, status: status, activity_snapshot: snapshot)
    end

    # Upsert semantics: at most one activity row per (user, subject). If a row
    # exists — regardless of its current status — refresh its snapshot and
    # promote it to the passed status. This keeps repeated edits (e.g. a review
    # edited three times) from spamming the feed with a new row each time; the
    # single row's `updated_at` bumps and it re-sorts to the top via `.recent`.
    def self.update_activity(user:, subject:, status:, snapshot: nil)
        activity = find_by(user: user, subject: subject)
        if activity.present?
            activity.update!(status: status, activity_snapshot: snapshot)
        else
            create!(user: user, subject: subject, status: status, activity_snapshot: snapshot)
        end
    end

    # Delete activity rows whose created_at is older than `older_than` ago.
    # Used by the daily scheduler tick; `older_than:` is parameterized so tests
    # can pass shorter windows without time-travel.
    def self.cleanup_old_records(older_than: 1.week)
        where("created_at < ?", older_than.ago).delete_all
    end

end

class CommunityThread < ApplicationRecord
    belongs_to :community
    belongs_to :user

    # NOTE: if parent_thread/root_thread is present, then the current thread is NOT the root thread
    # else if they are BOTH nil then the current thread is the root thread
    belongs_to :parent_thread, class_name: "CommunityThread", optional: true
    belongs_to :root_thread, class_name: "CommunityThread", optional: true

    has_many :child_threads, class_name: "CommunityThread", foreign_key: "parent_thread_id"
    validates :content, presence: true


    validate :title_for_only_root

    validates :root_thread_id, presence: true, if: -> { parent_thread_id.present? }
    validates :root_thread_id, absence: true, if: -> { parent_thread_id.blank? }

    # TODO: add attachments feature
    # has_many_attached :attachments

    private

    def title_for_only_root
        if (self.root_thread.present? || self.parent_thread.present?) && self.title.present?
            errors.add(:title, "title cannot be present for non-root threads")
        end
    end
    public
end

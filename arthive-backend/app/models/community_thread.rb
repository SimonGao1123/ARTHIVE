class CommunityThread < ApplicationRecord
    belongs_to :community
    belongs_to :user
    belongs_to :parent_thread, class_name: "CommunityThread", optional: true
    belongs_to :root_thread, class_name: "CommunityThread", optional: true

    has_many :child_threads, class_name: "CommunityThread", foreign_key: "parent_thread_id"

    validates :title, presence: true
    validates :content, presence: true
    validates :if_root, inclusion: { in: [true, false] }

    # guarentees that cannot point back at itself
    validates :root_thread_id, presence: true, unless: :if_root

    # If thread isn't the root thread, it must have a parent thread
    validates :parent_thread_id, presence: true, unless: :if_root

    # TODO: add attachments feature
    # has_many_attached :attachments
end

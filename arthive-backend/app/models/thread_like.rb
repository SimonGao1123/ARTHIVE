class ThreadLike < ApplicationRecord
    belongs_to :community_thread
    belongs_to :user

    validates :community_thread_id, presence: true
    validates :user_id, presence: true
    validates :community_thread_id, uniqueness: { scope: :user_id }
end

class ThreadLike < ApplicationRecord
    include SharedScopeMethods
    belongs_to :community_thread
    belongs_to :user

    validates :community_thread_id, presence: true
    validates :user_id, presence: true
    validates :community_thread_id, uniqueness: { scope: :user_id }

    has_many :activities, -> { where(activity_type: "ThreadLike") }, foreign_key: :activity_id, dependent: :delete_all

    def self.toggle_like(user_id, thread_id)
        like = find_by(user_id: user_id, community_thread_id: thread_id)

        if like.present?
            like.destroy
            return false
        else
            create!(user_id: user_id, community_thread_id: thread_id)
            
            return true
        end
    end
end

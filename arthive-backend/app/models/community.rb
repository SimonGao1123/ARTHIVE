class Community < ApplicationRecord
    include SharedScopeMethods
    belongs_to :media
    has_many :community_threads, dependent: :destroy
    
    validates :media_id, presence: true

    def root_threads (current_user_id)
        self.community_threads
        .where(parent_thread: nil, root_thread: nil)
        .order_threads(current_user_id)
    end
end

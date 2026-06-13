class Community < ApplicationRecord
    include SharedScopeMethods
    # one to one with media currently
    belongs_to :media
    has_many :community_threads, dependent: :destroy
    
    validates :media_id, presence: true

    def root_threads (current_user_id, query: nil)
        self.community_threads
        .where(parent_thread: nil, root_thread: nil)
        .where(user_id: User.visible_to(current_user_id).select(:id))
        .order_threads(current_user_id)
        .query_filter(query)
    end

end

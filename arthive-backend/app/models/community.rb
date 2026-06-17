class Community < ApplicationRecord
    include SharedScopeMethods
    # one to one with media currently
    belongs_to :media
    has_many :community_threads, dependent: :destroy
    
    validates :media_id, presence: true

    def root_threads(current_user_id, query: nil)
        CommunityThread
            .semantic_search(query, "community_thread", nil)
            .where(community_id: id)
            .where(parent_thread_id: nil, root_thread_id: nil)
            .where(user_id: User.visible_to(current_user_id).select(:id))
            .order_threads(current_user_id)
    end

end

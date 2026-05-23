class CommunityThread < ApplicationRecord
    include SharedScopeMethods
    belongs_to :community
    belongs_to :user

    has_many :thread_likes, dependent: :delete_all

    # NOTE: if parent_thread/root_thread is present, then the current thread is NOT the root thread
    # else if they are BOTH nil then the current thread is the root thread
    belongs_to :parent_thread, class_name: "CommunityThread", optional: true
    belongs_to :root_thread, class_name: "CommunityThread", optional: true

    has_many :child_threads, class_name: "CommunityThread", foreign_key: "parent_thread_id"
    validates :content, presence: true


    validate :title_for_only_root

    validates :root_thread_id, presence: true, if: -> { parent_thread_id.present? }
    validates :root_thread_id, absence: true, if: -> { parent_thread_id.blank? }

    has_many_attached :images

    belongs_to :review, optional: true


    private

    def title_for_only_root
        if (self.root_thread.present? || self.parent_thread.present?) && self.title.present?
            errors.add(:title, "title cannot be present for non-root threads")
        end
    end
    public

    scope :sort_by_likes, -> {
        left_joins(:thread_likes)
        .select("community_threads.*, COUNT(thread_likes.id) AS likes_count")
        .group("community_threads.id")
        .order(Arel.sql("likes_count DESC"))
    }

    scope :order_threads, -> (current_user_id) {
        includes(:user, :child_threads, :thread_likes)
        .in_order_of(:user_id, [current_user_id], filter: false)
        .sort_by_likes
        .recent
    }

    scope :query_filter, -> (query) {
        if query.present?
            where('community_threads.title ILIKE ? OR community_threads.content ILIKE ?', "%#{query}%", "%#{query}%")
        end
    }

    def self.search(query:, search_filter:, current_user_id:)
        base_search = CommunityThread
        .order_threads(current_user_id)
        .query_filter(query)
        .where(root_thread_id: nil, parent_thread_id: nil)
        .where(user_id: User.visible_to(current_user_id).select(:id))
        

        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.where(community_id: Community.where(media_id: Media.content_type_filter(normalized_values).select(:id)).select(:id))
                    when "genre"
                        base_search = base_search.where(community_id: Community.where(media_id: Media.genre_filter(normalized_values).select(:id)).select(:id))
                end
            end
        end

        base_search
    end
end


class CommunityThread < ApplicationRecord
    include SharedScopeMethods
    belongs_to :community
    belongs_to :user

    has_neighbors :embedding

    MAX_DEPTH = 5.freeze

    has_many :thread_likes, dependent: :destroy
    has_many :activities, -> { where(activity_type: "CommunityThread") }, foreign_key: :activity_id, dependent: :delete_all
    has_many :parent_thread_notifications, class_name: "Notification", foreign_key: :parent_thread_id, dependent: :delete_all
    has_many :comment_thread_notifications, class_name: "Notification", foreign_key: :comment_thread_id, dependent: :delete_all

    # NOTE: if parent_thread/root_thread is present, then the current thread is NOT the root thread
    # else if they are BOTH nil then the current thread is the root thread
    belongs_to :parent_thread, class_name: "CommunityThread", optional: true, counter_cache: :child_threads_count
    belongs_to :root_thread, class_name: "CommunityThread", optional: true

    has_many :child_threads, class_name: "CommunityThread", foreign_key: "parent_thread_id", dependent: :destroy
    validates :content, presence: true


    validate :title_for_only_root
    validate :embedding_only_for_root

    validates :root_thread_id, presence: true, if: -> { parent_thread_id.present? }
    validates :root_thread_id, absence: true, if: -> { parent_thread_id.blank? }

    has_many_attached :images

    belongs_to :review, optional: true

    validate :depth_validation
    validate :depth_limit_validation

    after_commit :enqueue_embedding, on: [:create, :update], if: -> { (saved_change_to_content? || saved_change_to_title?) && root_thread_id.nil? && parent_thread_id.nil? }


    private

    def depth_validation
        if self.parent_thread_id.present?
            self.depth = self.parent_thread.depth + 1
        end
    end

    def depth_limit_validation
        if self.depth > MAX_DEPTH
            errors.add(:depth, "depth cannot be greater than #{MAX_DEPTH}")
        end
    end

    def enqueue_embedding
        return if SQS_CLIENT.nil?
        SQS_CLIENT.send_message(
            queue_url: SQS_QUEUE_URL,
            message_body: {
                type: "embedding",
                target_id: self.id,
                target_type: "community_thread"
            }.to_json
        )
    end

    def title_for_only_root
        if (self.root_thread.present? || self.parent_thread.present?) && self.title.present?
            errors.add(:title, "title cannot be present for non-root threads")
        end
    end

    def embedding_only_for_root
        if (self.root_thread.present? || self.parent_thread.present?) && self.embedding.present?
            errors.add(:embedding, "embedding cannot be present for non-root threads")
        end
    end
    public

    # Trending = recent likes * 2 + recent replies * 3.
    # Scoring expression lives inline in ORDER BY (no `SELECT … AS hotness_score`
    # alias) so eager_loaded chains (e.g. `.includes(:user, …).with_attached_*`)
    # don't trip on a SELECT-DISTINCT alias-not-found error.
    scope :sort_by_trending, -> {
        where(parent_thread_id: nil, root_thread_id: nil)
        .order(Arel.sql(<<~SQL.squish))
            (
              (SELECT COUNT(*) FROM thread_likes
               WHERE thread_likes.community_thread_id = community_threads.id
                 AND thread_likes.created_at > NOW() - INTERVAL '1 week') * 2
              +
              (SELECT COUNT(*) FROM community_threads AS ct
               WHERE ct.parent_thread_id = community_threads.id
                 AND ct.created_at > NOW() - INTERVAL '1 week') * 3
            ) DESC
        SQL
    }
    scope :sort_by_likes, -> {
        left_joins(:thread_likes)
        .select("community_threads.*, COUNT(thread_likes.id) AS likes_count")
        .group("community_threads.id")
        .order(Arel.sql("likes_count DESC"))
    }

    scope :order_threads, -> (current_user_id) {
        with_attached_images
        .includes({ user: { profile_picture_attachment: :blob } }, { community: :media }, :child_threads, :thread_likes)
        .in_order_of(:user_id, [current_user_id], filter: false)
        .sort_by_likes
        .recent
    }

    scope :query_filter, -> (query) {
        if query.present?
            where('community_threads.title ILIKE ? OR community_threads.content ILIKE ?', "%#{query}%", "%#{query}%")
        end
    }

    def self.search(query:, embedded_query:, search_filter:, current_user_id:)
        base_search = CommunityThread.semantic_search(query, "community_thread", embedded_query)
        .order_threads(current_user_id)
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


class Media < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods

    CONTENT_TYPES = {
        book: "book",
        film: "film",
        series: "series",
        game: "game"
    }.freeze

    GENRES = [
        "drama", "comedy", "romance", 
        "action", "adventure", "horror", "thriller", 
        "mystery", "crime", "science fiction", "fantasy", 
        "animation", "musical", "family", "western", 
        "war", "historical", "biographical", 
        "documentary", "experimental", "superhero", 
        "disaster", "survival", "sports", "spy", 
        "political", "road movie", "coming of age", 
        "slice of life", "noir"
    ].freeze

    SUMMARY_REVIEW_COUNT_MILESTONES = [5, 10, 25, 50, 100, 500, 1000].freeze

    belongs_to :user # user_id is the id of the user who created the media
    has_one_attached :cover_image
    has_many :reviews
    has_many :media_in_lists, dependent: :destroy

    has_one :community, dependent: :destroy

    validates :title, presence: true
    validates :creator, presence: true
    validates :year, presence: true
    validates :content_type, presence: true
    validates :language, presence: true
    validates :summary, presence: true
    validates :genre, presence: true
    validates :ongoing, inclusion: { in: [true, false] }
    enum :content_type, CONTENT_TYPES, prefix: true

    has_neighbors :embedding

    validate :validate_genres

    after_save :enqueue_embedding, if: -> { saved_change_to_title? || saved_change_to_summary? }

    

    private

    def enqueue_embedding
        AssignEmbeddingJob.perform_later(self.id, "media")
    end
    
    def validate_genres
        return if genre.blank?

        invalid = genre.select { |g| !GENRES.include?(g.downcase) }
        if !invalid.blank?
            errors.add(:genre, "Invalid genres: #{invalid.join(", ")}")
        end
    end

    public
    def presigned_cover_image_url
        PresignedUrlAttachment.presigned_url(cover_image)
    end

    

    # currently just searches for media that were recently created and not reviewed by user yet
    scope :newest_explore_page, -> (content_type: "all", user_id: nil) {
        joins(
        sanitize_sql_array([
            "LEFT JOIN reviews ON reviews.media_id = #{table_name}.id AND reviews.user_id = ?",
            user_id
        ])
        )
        .order(Arel.sql("reviews.id IS NULL DESC"))
        .content_type_filter(content_type)
        .recent
    }

    # most reviews/threads on the media within the last week (hottest)        
    scope :hottest_explore_page, ->(content_type: "all", user_id: nil) {
        select(<<~SQL
          media.*,
          (
            (SELECT COUNT(*) FROM reviews
               WHERE reviews.created_at > NOW() - INTERVAL '1 week' AND reviews.media_id = media.id) * 2
            +
            (SELECT COUNT(*) FROM community_threads
               JOIN communities ON community_threads.community_id = communities.id
               WHERE community_threads.created_at > NOW() - INTERVAL '1 week' AND communities.media_id = media.id) * 3
            +
            COALESCE(
              (SELECT AVG(rating) FROM reviews WHERE reviews.created_at > NOW() - INTERVAL '1 week' AND reviews.media_id = media.id),
              0
            ) * 5
          ) AS hotness_score
        SQL
        )
        .order("hotness_score DESC")
        .content_type_filter(content_type)
        .recent
    }


    scope :query_filter, -> (query) {
        where('title ILIKE ?', "%#{query}%")
    }
    scope :genre_filter, -> (genre) {
        where(
            <<-SQL, genre, genre.length
            (
                SELECT COUNT(DISTINCT LOWER(g))
                FROM unnest(genre) AS g
                WHERE LOWER(g) IN (?)
            ) = ?
            SQL
        )
    }
    scope :content_type_filter, -> (type) {
        type == "all" ? all : where(content_type: type)
    }
    
    def self.obtain_media_reviews(media_id, query, current_user_id, sort_by)
        reviews = Review.semantic_search(query, "review", nil)
        .where(media_id: media_id)
        .where.not(content: [nil, ""])
        .includes(:user)
        .in_order_of(:user_id, [current_user_id], filter: false)

        if sort_by == "newest"
            reviews = reviews.recent
        elsif sort_by == "trending"
            reviews = reviews.sort_by_trending
        end

        return reviews
    end

    def self.search(query:, embedded_query:, search_filter:)
        base_search = Media.semantic_search(query, "media", embedded_query)

        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.content_type_filter(normalized_values)
                    when "genre"
                        base_search = base_search.genre_filter(normalized_values)
                    end
            end
        end

        return base_search
    end

    def self.liked_or_finished_media(user_id, content_type, query, page_num, limit, type)
        reviews = Review.includes(:media).where(user_id: user_id)
        if type == "liked"
            reviews = reviews.where(if_favorite: true)
        elsif type == "finished"
            reviews = reviews.where(if_finished: true)
        else
            raise GraphQL::ExecutionError, "Invalid type"
        end

        user = User.find_by(id: user_id)
        if !user.present?
            raise GraphQL::ExecutionError, "User #{user_id} not found"
        end

        base_search = Media.where(id: reviews.pluck(:media_id)).content_type_filter(content_type).semantic_search(query, "media", nil).recent

        total_count = base_search.count
        total_pages = (total_count.to_f / limit).ceil
        base_search = base_search.page(page_num, limit)
        return {
            user: user,
            media: base_search,
            page_info: {
                total_pages: total_pages,
                total_count: total_count
            }
        }
    end

end

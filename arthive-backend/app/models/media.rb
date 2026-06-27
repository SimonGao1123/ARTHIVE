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


    belongs_to :user # user_id is the id of the user who created the media
    has_one_attached :cover_image
    has_many :reviews, dependent: :destroy
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

    after_commit :enqueue_embedding, on: [:create, :update], if: -> { saved_change_to_title? || saved_change_to_summary? }

    validate :validate_page_actors

    

    private
    def validate_page_actors
        if page_count.present? && actors.present?
            errors.add(:page_count, "Page count and actors cannot be present together")
        end
    end

    def enqueue_embedding
        return if SQS_CLIENT.nil?
        SQS_CLIENT.send_message(
            queue_url: SQS_QUEUE_URL,
            message_body: {
                type: "embedding",
                target_id: self.id,
                target_type: "media"
            }.to_json
        )
    end
    
    def validate_genres
        return if genre.blank?

        invalid = genre.select { |g| !GENRES.include?(g.downcase) }
        if !invalid.blank?
            errors.add(:genre, "Invalid genres: #{invalid.join(", ")}")
        end
    end

    public

    scope :needing_summary_refresh, -> {
        joins(:reviews).where('reviews.content IS NOT NULL')
        .group('media.id')
        .having('COUNT(reviews.id) >= COALESCE(media.last_ai_summary_review_count, 0)*2 + 5') # add 10 to the last review count to avoid refreshing too often
    }

    def presigned_cover_image_url
        PresignedUrlAttachment.presigned_url(cover_image)
    end

    # takes recent / highly rated review from user and suggests media that are similar to the media reviewed by the user
    # looks at that media's sorted by most similar media to suggest
    def self.because_of_reviews(content_type: "all", user_id: nil)
        user_review = Review.includes(:media)
        .where(user_id: user_id)
        .joins(:media).where.not(media: { embedding: nil })
        .order(Arel.sql("(reviews.created_at > NOW() - INTERVAL '7 days') DESC, rating DESC NULLS LAST"))
        .first

        return nil if user_review.nil?

        source = user_review.media
        # can match via title/genre/description/actors via similarity search
        closest_media = source.nearest_neighbors(:embedding, distance: "cosine")
            .where.not(id: source.id)
            .content_type_filter(content_type)
            .includes(:user, :community)
            .with_attached_cover_image

        return {
            media: closest_media,
            source: source
        }
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

    # Hotness combines damped recent volume signals (reviews, favorites, threads,
    # review likes) with a confidence-weighted quality bump (avg rating - 3, scaled
    # by sqrt of the rated-review count). LN(1+x) prevents whales from dominating;
    # the quality term penalizes media trending below 3 stars.
    # Scoring expression lives inline in ORDER BY (no `SELECT … AS hotness_score`
    # alias) so eager_loaded chains (e.g. `.includes(...).with_attached_cover_image`)
    # don't trip on a SELECT-DISTINCT alias-not-found error.
    scope :hottest_explore_page, ->(content_type: "all", user_id: nil) {
        order(Arel.sql(<<~SQL.squish))
          (
            LN(1 + (
              SELECT COUNT(*) FROM reviews
                WHERE reviews.created_at > NOW() - INTERVAL '1 week'
                  AND reviews.media_id = media.id
            )) * 3
            +
            LN(1 + (
              SELECT COUNT(*) FROM reviews
                WHERE reviews.created_at > NOW() - INTERVAL '1 week'
                  AND reviews.media_id = media.id
                  AND reviews.if_favorite = TRUE
            )) * 4
            +
            LN(1 + (
              SELECT COUNT(*) FROM community_threads
                JOIN communities ON community_threads.community_id = communities.id
                WHERE community_threads.created_at > NOW() - INTERVAL '1 week'
                  AND communities.media_id = media.id
            )) * 2
            +
            LN(1 + (
              SELECT COUNT(*) FROM review_likes
                JOIN reviews ON review_likes.review_id = reviews.id
                WHERE review_likes.created_at > NOW() - INTERVAL '1 week'
                  AND reviews.media_id = media.id
            )) * 1.5
            +
            COALESCE((
              SELECT (AVG(rating) - 3) * SQRT(COUNT(*)) FROM reviews
                WHERE reviews.created_at > NOW() - INTERVAL '1 week'
                  AND reviews.media_id = media.id
                  AND reviews.rating IS NOT NULL
            ), 0) * 1.2
          ) DESC
        SQL
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
        .where(user_id: User.visible_to(current_user_id).pluck(:id))
        .includes(:user, :media, :review_comments, :review_likes)
        .with_attached_images
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

        return base_search.includes(:user, :community).with_attached_cover_image
    end

    def self.obtain_media_likes_page(user, content_type, query, page_num, limit)
        liked_media_ids = Review.where(user_id: user.id, if_favorite: true).select(:media_id)
        base_search = Media.where(id: liked_media_ids)
                           .content_type_filter(content_type)
                           .semantic_search(query, "media", nil)
                           .recent
        total_count = base_search.count
        total_pages = (total_count.to_f / limit).ceil
        return {
            user: user,
            media: base_search.page(page_num, limit).includes(:user, :community).with_attached_cover_image,
            page_info: {
                total_pages: total_pages,
                total_count: total_count
            }
        }
    end

    def self.finished_media(user_id, content_type, query, page_num, limit)
        reviews = Review.includes(:media).where(user_id: user_id)
        reviews = reviews.where(if_finished: true)

        user = User.find_by(id: user_id)
        if !user.present?
            raise GraphQL::ExecutionError, "User #{user_id} not found"
        end

        base_search = Media.where(id: reviews.pluck(:media_id)).content_type_filter(content_type).semantic_search(query, "media", nil).recent

        total_count = base_search.count
        total_pages = (total_count.to_f / limit).ceil
        base_search = base_search.page(page_num, limit).includes(:user, :community).with_attached_cover_image
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

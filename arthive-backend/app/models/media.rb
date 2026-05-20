class Media < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods

    CONTENT_TYPES = {
        book: "book",
        film: "film",
        series: "series",
        game: "game"
    }.freeze

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

    def presigned_cover_image_url
        PresignedUrlAttachment.presigned_url(cover_image)
    end

    

    scope :explore_page, -> (content_type: "all", user_id: nil) {
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

    def self.search(query:, search_filter:)
        base_search = Media.query_filter(query)

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

        base_search = Media.where(id: reviews.pluck(:media_id)).content_type_filter(content_type).query_filter(query).recent

        total_count = base_search.count
        total_pages = (total_count.to_f / limit).ceil
        base_search = base_search.page(page_num, limit)
        return {
            media: base_search,
            page_info: {
                total_pages: total_pages,
                total_count: total_count
            }
        }
    end

end

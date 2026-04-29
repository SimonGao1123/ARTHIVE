class Media < ApplicationRecord
    include PresignedUrlAttachment
    include SharedScopeMethods
    belongs_to :user # user_id is the id of the user who created the media
    has_one_attached :cover_image
    has_many :reviews

    validates :title, presence: true
    validates :creator, presence: true
    validates :year, presence: true
    validates :content_type, presence: true
    validates :language, presence: true
    validates :summary, presence: true
    validates :genre, presence: true
    validates :ongoing, inclusion: { in: [true, false] }
    enum :content_type, { book: "book", film: "film", series: "series", game: "game" }, prefix: true

    def presigned_cover_image_url
        PresignedUrlAttachment.presigned_url(cover_image)
    end

    scope :content_type_filter, -> (type) {
        type == "all" ? all : where(content_type: type)
    }

    scope :explore_page, -> (content_type, page_num, limit, user_id) {
        joins(
        sanitize_sql_array([
            "LEFT JOIN reviews ON reviews.media_id = #{table_name}.id AND reviews.user_id = ?",
            user_id
        ])
        )
        .order(Arel.sql("reviews.id IS NULL DESC"))
        .content_type_filter(content_type)
        .recent
        .page(page_num, limit)
    }

    def self.if_next_page_exists(content_type, page_num, limit, user_id)
        Media.explore_page(content_type, page_num + 1, limit, user_id).exists?
    end


    def self.media_reviews_page(media_id, page_num, limit, user_id)
        begin
            media = Media.find(media_id)
            # Order current user's review first without filtering out others.
            reviews = media.reviews
                .where.not(content: [nil, ""])
                .includes(:user)
                .in_order_of(:user_id, [user_id], filter: false)
                .sort_by_likes
                .page(page_num, limit)
                .to_a
            return reviews # returns a paginated list of reviews
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end

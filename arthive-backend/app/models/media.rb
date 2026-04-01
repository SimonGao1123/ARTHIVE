class Media < ApplicationRecord
    include PresignedUrlAttachment
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
    enum :content_type, { book: "book", film: "film", series: "series" }, prefix: true

    def presigned_cover_image_url
        PresignedUrlAttachment.presigned_url(cover_image)
    end

    scope :recent, -> {order(created_at: :desc)}
    scope :content_type_filter, -> (type) {
        type == "any" ? all : where(content_type: type)
    }
    scope :page, -> (page_num, limit) {offset((page_num-1)*limit).limit(limit)}

    # TODO: add code for only returning media for not seen media, NEED TO HAVE USER ID INPUT
    scope :explore_page, -> (content_type, page_num, limit) {
        content_type_filter(content_type).recent.page(page_num, limit)
    }

    def self.if_next_page_exists(content_type, page_num, limit)
        Media.explore_page(content_type, page_num + 1, limit).exists?
    end
end

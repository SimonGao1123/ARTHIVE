class Media < ApplicationRecord
    belong_to :user # user_id is the id of the user who created the media
    has_one_attached :cover_image

    validates :title, presence: true
    validates :creator, presence: true
    validates :year, presence: true
    validates :content_type, presence: true
    validates :language, presence: true
    validates :summary, presence: true
    validates :genre, presence: true
    validates :ongoing, inclusion: { in: [true, false] }
    validates :cover_image, presence: true

    # content type can only be book, film, or series
    enum content_type: { book: "book", film: "film", series: "series" }

    validates :cover_image, blob: { content_type: ['image/png', 'image/jpg', 'image/jpeg'] }

    # TODO: DETERMINE ALL POSSIBLE GENRES
end

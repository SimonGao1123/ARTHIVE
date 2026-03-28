class Media < ApplicationRecord
    belongs_to :user # user_id is the id of the user who created the media
    has_one_attached :cover_image

    validates :title, presence: true
    validates :creator, presence: true
    validates :year, presence: true
    validates :content_type, presence: true
    validates :language, presence: true
    validates :summary, presence: true
    validates :genre, presence: true
    validates :ongoing, inclusion: { in: [true, false] }
    enum :content_type, { book: "book", film: "film", series: "series" }, prefix: true


    # TODO: DETERMINE ALL POSSIBLE GENRES
end

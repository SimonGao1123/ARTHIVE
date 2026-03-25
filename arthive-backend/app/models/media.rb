class Media < ApplicationRecord
    belong_to :user
    has_one_attached :cover_image

    validates :title, presence: true
    validates :creator, presence: true
    validates :year, presence: true
    validates :content_type, presence: true
    validates :language, presence: true
    validates :summary, presence: true
    validates :genre, presence: true
    validates :ongoing, inclusion: { in: [true, false] }

    # content type can only be book, movie, or tv_show
    enum content_type: { book: 0, film: 1, series: 2 }

    # TODO: DETERMINE ALL POSSIBLE GENRES
end

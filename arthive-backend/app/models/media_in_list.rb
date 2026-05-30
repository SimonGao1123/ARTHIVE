class MediaInList < ApplicationRecord
    include SharedScopeMethods
    belongs_to :list
    belongs_to :media

    validates :list_id, uniqueness: { scope: :media_id }
    validates :media_id, presence: true
    validates :list_id, presence: true  
    has_many :activities, -> { where(activity_type: "MediaInList") }, foreign_key: :activity_id, dependent: :delete_all

    scope :query_filter, -> (query) {
        if query.present?
            joins(:media)
            .where("media.title ILIKE ? OR media.summary ILIKE ?", "%#{query}%", "%#{query}%")
        end
    }
end

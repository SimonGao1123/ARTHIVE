class List < ApplicationRecord
    include SharedScopeMethods

    belongs_to :user
    has_many :media_in_lists, dependent: :destroy

    validates :name, presence: true
    validates :if_private, inclusion: { in: [true, false] }
    validates :user_id, presence: true
    validates :description, length: { maximum: 280 }

    validate :content_type_validation

    

    private

    def content_type_validation
        self.content_type.each do |content_type|
            if !Media::CONTENT_TYPES.values.include?(content_type)
                errors.add(:content_type, "is not a valid content type")
            end
        end
    end
    public

    scope :query_filter, ->(query) {
        if query.present?
            where("name ILIKE ? OR description ILIKE ?", "%#{query}%", "%#{query}%")
        end
    }
    
    scope :content_type_filter, ->(content_type) {
        where("content_type @> ARRAY[?]::varchar[]", [content_type])
    }

    scope :user_visible_filter, ->(current_user_id) {
        # hide lists where user is not visible, and hide lists that are private UNLESS the user is the owner
        where(if_private: false).or(where(user_id: current_user_id))
    }
    def self.search(query:, search_filter:, current_user_id:)
        base_search = List.query_filter(query)
        base_search = base_search.user_visible_filter(current_user_id)

        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.content_type_filter(normalized_values)
                end
            end
        end

        return base_search.includes(:user, :media_in_lists => :media).recent
    end
end
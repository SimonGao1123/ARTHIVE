class List < ApplicationRecord
    belongs_to :user
    has_many :media_in_lists, dependent: :destroy

    validates :name, presence: true
    validates :content_type, presence: true
    validates :if_private, inclusion: { in: [true, false] }
    validates :tags, presence: true
    validates :user_id, presence: true

    validate :content_type_validation

    private

    def content_type_validation
        self.content_type.each do |content_type|
            if !Media::CONTENT_TYPES.include?(content_type)
                errors.add(:content_type, "is not a valid content type")
            end
        end
    end
    public
    
end

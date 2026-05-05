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
    
end

class ListLike < ApplicationRecord
    belongs_to :list
    belongs_to :user

    validates :list_id, uniqueness: { scope: :user_id }
    
    has_many :activities, -> { where(activity_type: "ListLike") }, foreign_key: :activity_id, dependent: :delete_all
    def self.toggle_like(user_id, list_id)
        like = find_by(user_id: user_id, list_id: list_id)
        if like.present?
            like.destroy
            return false
        else
            create!(user_id: user_id, list_id: list_id)   
            return true
        end
    end
end

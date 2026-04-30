class MediaInList < ApplicationRecord
    belongs_to :list
    belongs_to :media

    validates :list_id, uniqueness: { scope: :media_id }
    validates :media_id, presence: true
    validates :list_id, presence: true  
end

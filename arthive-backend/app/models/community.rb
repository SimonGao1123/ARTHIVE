class Community < ApplicationRecord
    belongs_to :media
    has_many :community_threads, dependent: :destroy
    
    validates :media_id, presence: true
    validates :media_id, uniqueness: true
end

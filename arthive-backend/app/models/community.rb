class Community < ApplicationRecord
    belongs_to :media
    has_many :community_threads, dependent: :destroy
    

end

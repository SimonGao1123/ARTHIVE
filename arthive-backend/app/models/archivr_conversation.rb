class ArchivrConversation < ApplicationRecord
    belongs_to :user
    belongs_to :media
    has_many :archivr_messages, dependent: :destroy
end
class ArchivrMessage < ApplicationRecord
    belongs_to :archivr_conversation
    validates :content, presence: true
    validates :role, presence: true

    enum :role, {
        user: "user",
        assistant: "assistant"
    }
end
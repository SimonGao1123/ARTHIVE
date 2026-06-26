class ListSave < ApplicationRecord
    belongs_to :list, counter_cache: true
    belongs_to :user

    validates :list_id, uniqueness: { scope: :user_id }

    has_many :activities, -> { where(activity_type: "ListSave") }, foreign_key: :activity_id, dependent: :delete_all

    def self.toggle_save(user_id, list_id)
        save = find_by(user_id: user_id, list_id: list_id)
        if save.present?
            save.destroy
            return false
        else
            create!(user_id: user_id, list_id: list_id)
            return true
        end
    end


end

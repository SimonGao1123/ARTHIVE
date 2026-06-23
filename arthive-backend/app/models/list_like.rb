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

    # Delete likes on `list` whose user can no longer see the list per the
    # current visibility rules in `List.if_visible_to_user`.
    def self.normalize_for_list(list)
        return if list.blank?
        list.list_likes.find_each do |like|
            like.destroy unless List.if_visible_to_user(like.user_id, list)
        end
    end

    # Walk every list owned by `owner_id` and normalize each.
    # Used when the owner's visibility narrows or a Follow flips out of accepted.
    def self.normalize_for_owner(owner_id)
        List.where(user_id: owner_id).find_each { |list| normalize_for_list(list) }
    end
end

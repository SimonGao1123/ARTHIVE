class List < ApplicationRecord
    include SharedScopeMethods

    belongs_to :user
    has_many :media_in_lists, dependent: :destroy

    has_neighbors :embedding

    has_many :list_likes, dependent: :destroy
    has_many :list_saves, class_name: "ListSave", dependent: :destroy
    has_many :notifications, dependent: :delete_all
    has_many :list_members, dependent: :destroy
    validates :name, presence: true
    validates :if_private, inclusion: { in: [true, false] }
    validates :user_id, presence: true
    validates :description, length: { maximum: 280 }

    has_many :activities, -> { where(activity_type: "List") }, foreign_key: :activity_id, dependent: :delete_all

    

    validate :content_type_validation

    after_commit :enqueue_embedding, on: [:create, :update], if: -> { saved_change_to_name? || saved_change_to_description? || saved_change_to_tags? }

    private

    def enqueue_embedding
        return if SQS_CLIENT.nil?
        SQS_CLIENT.send_message(
            queue_url: SQS_QUEUE_URL,
            message_body: {
                type: "embedding",
                target_id: self.id,
                target_type: "list"
            }.to_json
        )
    end

    def content_type_validation
        self.content_type.each do |content_type|
            if !Media::CONTENT_TYPES.values.include?(content_type)
                errors.add(:content_type, "is not a valid content type")
            end
        end
    end
    public

    scope :query_filter, ->(query) {
        if query.present?
            where("name ILIKE ? OR description ILIKE ?", "%#{query}%", "%#{query}%")
        end
    }
    
    scope :content_type_filter, ->(content_type) {
        if content_type != "all"
            where("content_type @> ARRAY[?]::varchar[]", content_type)
        end
    }

    # gets most popular lists.
    # Score = recent-likes + recent-saves (each contributes 1 point), where
    # "recent" means within the last week. Computed in two steps so the returned
    # relation has NO `.group(:id)`, which otherwise collides with `.includes(...)`
    # eager-loads (any joined-in column like users.id would need to appear in
    # GROUP BY).
    scope :trending_lists, ->(content_type: "all", user_id: nil) {
        score_sql = <<~SQL.squish
            (SELECT COUNT(*) FROM list_likes
             WHERE list_likes.list_id = lists.id
               AND list_likes.created_at > NOW() - INTERVAL '1 week')
            +
            (SELECT COUNT(*) FROM list_saves
             WHERE list_saves.list_id = lists.id
               AND list_saves.created_at > NOW() - INTERVAL '1 week')
        SQL

        ranked_ids = List
            .where(id: List.user_visible_filter(user_id).select(:id))
            .where("(#{score_sql}) > 0")
            .order(Arel.sql("(#{score_sql}) DESC"))
            .pluck(:id)

        where(id: ranked_ids).in_order_of(:id, ranked_ids).content_type_filter(content_type)
    }

    def self.if_visible_to_user(user_id, list)
        if user_id.nil?
            return false if list.if_private
            return User.if_visible_to_user(nil, list.user_id)
        end

        if list.list_members.where(user_id: user_id, status: "accepted").exists? || list.user_id == user_id
            return true
        end

        if !User.if_visible_to_user(user_id, list.user_id) || list.if_private
            return false
        end

        return true
    end
    def self.editable_by_user(user_id, list)

        return list.user_id == user_id || list.list_members.where(user_id: user_id, status: "accepted", role: "admin").exists?
    end
    def self.if_member_of_list(user_id, list)
        ListMember.exists?(list_id: list.id, user_id: user_id, status: "accepted") || list.user_id == user_id
    end
    scope :user_visible_filter, ->(current_user_id) {
        if current_user_id.nil?
            where(if_private: false, user_id: User.where(visibility: "public").select(:id))
        else
            # hide lists where user is not visible, and hide lists that are private UNLESS the user is the owner
            left_outer_joins(:list_members)
            .where(
                "(lists.if_private = false AND lists.user_id IN (:visible))
                OR lists.user_id = :uid
                OR (list_members.user_id = :uid AND list_members.status = 'accepted')",
                visible: User.visible_to(current_user_id).select(:id),
                uid: current_user_id
            ).distinct
        end
    }
    scope :user_editable_filter, ->(current_user_id) {
        left_outer_joins(:list_members)
        .where(
            "(lists.user_id = :uid OR 
            (list_members.user_id = :uid AND list_members.status = 'accepted' AND list_members.role = 'admin'))",
            uid: current_user_id
        ).distinct
    }
    # filters lists that user owns / is a member of / admin
    scope :user_membership_filter, ->(current_user_id) {
        left_outer_joins(:list_members)
        .where(
            "lists.user_id = :uid OR (list_members.user_id = :uid AND list_members.status = 'accepted')",
            uid: current_user_id
        ).distinct
    }
    def self.search(query:, embedded_query:, search_filter:, current_user_id:)
        base_search = List.semantic_search(query, "list", embedded_query)
            .user_visible_filter(current_user_id)

        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.content_type_filter(normalized_values)
                end
            end
        end

        return base_search.includes(:user, :list_likes, { list_members: :user }, media_in_lists: :media).recent
    end


    def self.add_or_remove_media(list_id, media_ids, if_add, user_id)
        user = User.find_by(id: user_id)
        if !user.present?
            return {error: "User not found"}
        end
        list = List.find_by(id: list_id)

        if !list.present?
            return {error: "List not found"}
        end

        new_content_type = Set.new(list.content_type.to_a)
        error = nil

        ActiveRecord::Base.transaction do
            media_ids.each do |media_id|
                media = Media.find_by(id: media_id)
                if !media.present?
                    error = "Media #{media_id} not found"
                    raise ActiveRecord::Rollback
                end

                if if_add
                    media_in_list = MediaInList.new(list: list, media: media)

                    if !media_in_list.save
                        error = media_in_list.errors.full_messages.join(", ").presence ||
                            "Failed to add media #{media.title} to list #{list.name}"
                        raise ActiveRecord::Rollback
                    end

                    Activity.log(user: user, subject: media_in_list, status: "created", snapshot: {
                        list_name: list.name
                    })

                    new_content_type << media.content_type
                else
                    media_in_list = MediaInList.find_by(list_id: list_id, media_id: media_id)
                    if !media_in_list.present?
                        error = "Media #{media.title} not in list #{list.name}"
                        raise ActiveRecord::Rollback
                    end
                    if !media_in_list.destroy
                        error = "Failed to remove media #{media.title} from list #{list.name}"
                        raise ActiveRecord::Rollback
                    end
                end
            end

            # recompute content type
            if !if_add
                new_content_type = Set.new(
                    list.media_in_lists.reload.includes(:media).map { |mil| mil.media.content_type }
                )
            end

            if !list.update(content_type: new_content_type.to_a)
                error = "Failed to update list content type"
                raise ActiveRecord::Rollback
            end
        end

        return {error: error} if error

        return list
    end

    def self.obtain_list_likes_page(user, query, page_num, limit, content_type, context_user_id)
        lists = List.where(id: ListLike.where(user_id: user.id).select(:list_id))
                    .content_type_filter(content_type)
                    .semantic_search(query, "list", nil)
                    .user_visible_filter(context_user_id)

        total_count = lists.count
        total_pages = (total_count.to_f / limit).ceil
        return {
            lists: lists.page(page_num, limit).includes(:user, :list_likes, list_members: :user),
            user: user,
            page_info: {
                total_pages: total_pages,
                total_count: total_count
            }
        }
    end


    def normalize_likes_saves_for_list
        return if self.blank?
        self.list_likes.find_each do |like|
            like.destroy unless List.if_visible_to_user(like.user_id, self)
        end
        self.list_saves.find_each do |save|
            save.destroy unless List.if_visible_to_user(save.user_id, self)
        end
    end

    def self.normalize_likes_saves_for_owner(owner_id)
        List.where(user_id: owner_id).find_each { |list| list.normalize_likes_saves_for_list }
    end

end
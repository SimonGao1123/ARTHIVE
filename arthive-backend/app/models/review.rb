class Review < ApplicationRecord
    include SharedScopeMethods

    # POSSIBLY NEED ADJUSTMENT (higher = lax, lower = strict)
    belongs_to :user
    # NOTE: counter_cache is managed manually so media.reviews_count only
    # tracks reviews whose `content` is present (see *_review_count callbacks below).
    belongs_to :media

    has_many :review_comments, dependent: :delete_all
    has_many :review_likes, dependent: :delete_all
    has_many :notifications, dependent: :delete_all

    has_many :activities, -> { where(activity_type: "Review") }, foreign_key: :activity_id, dependent: :delete_all

    validates :content, length: { maximum: 5000 }
    validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
    validates :if_favorite, inclusion: { in: [true, false] }
    validates :if_finished, inclusion: { in: [true, false] }

    # guarentees that a review is unique for a user and a media
    validates :user_id, uniqueness: { scope: :media_id }

    has_many_attached :images

    has_neighbors :embedding     


    after_commit :enqueue_embedding, on: [:create, :update], if: -> { saved_change_to_content? }

    # media.reviews_count tracks only reviews with content present.
    # Stock counter_cache can't express that, so increment/decrement manually
    # whenever content presence transitions across the create/update/destroy boundary.
    after_create  :increment_media_review_count_if_content_present
    after_update  :sync_media_review_count_on_content_change
    after_destroy :decrement_media_review_count_if_content_present

    private
    def increment_media_review_count_if_content_present
        Media.increment_counter(:reviews_count, media_id) if content.present?
    end

    def sync_media_review_count_on_content_change
        return unless saved_change_to_content?
        was_present = saved_change_to_content.first.present?
        is_present  = saved_change_to_content.last.present?
        return if was_present == is_present
        if is_present
            Media.increment_counter(:reviews_count, media_id)
        else
            Media.decrement_counter(:reviews_count, media_id)
        end
    end

    def decrement_media_review_count_if_content_present
        Media.decrement_counter(:reviews_count, media_id) if content.present?
    end

    def enqueue_embedding
        return if SQS_CLIENT.nil?
        SQS_CLIENT.send_message(
            queue_url: SQS_QUEUE_URL,
            message_body: {
                type: "embedding",
                target_id: self.id,
                target_type: "review"
            }.to_json
        )
    end

    public
    def presigned_images_url
        images.map do |image|
            PresignedUrlAttachment.presigned_url(image)
        end
    end
    
    def self.retrieve_review(user_id, media_id)
        review = find_by(user_id: user_id, media_id: media_id)
        if review.present?
            return review
        else
            return nil
        end
    end

    # Trending = all-time likes + all-time comments * 2.
    # Scoring expression lives inline in ORDER BY (no `SELECT … AS trending_score`
    # alias) so eager_loaded chains (e.g. `.includes(...).with_attached_images`)
    # don't trip on a SELECT-DISTINCT alias-not-found error.
    scope :sort_by_trending, -> {
        order(Arel.sql(<<~SQL.squish
            (
              (SELECT COUNT(*) FROM review_likes WHERE created_at > NOW() - INTERVAL '7 days' AND review_likes.review_id = reviews.id)
              +
              (SELECT COUNT(*) FROM review_comments WHERE created_at > NOW() - INTERVAL '7 days' AND review_comments.review_id = reviews.id) * 2
            ) DESC
        SQL
        ))
        .includes(:user, :media)
    }

    # updates review if review_id is provided, otherwise creates a new review
    def self.update_review(user_id, media_id, content, rating, if_favorite, if_finished, review_id)
        if review_id.present?
            review = includes(:review_comments, :review_likes).find_by(id: review_id, user_id: user_id, media_id: media_id)
            if review.present?
                # if content is removed, delete all comments and likes
                if content.blank?
                    comment_ids = review.review_comments.pluck(:id)
                    like_ids = review.review_likes.pluck(:id)
                    # destroy_all (not delete_all) so the per-row destroy callback
                    # decrements reviews.review_comments_count / review_likes_count
                    review.review_comments.destroy_all
                    review.review_likes.destroy_all

                    Activity.where(activity_type: "ReviewComment", activity_id: comment_ids).destroy_all
                    Activity.where(activity_type: "ReviewLike", activity_id: like_ids).destroy_all
                    review.images.purge # delete all images on an empty review
                end

                if content.blank? && rating.blank? && !if_favorite && !if_finished
                    review.destroy!
                    return {review: nil, deleted: true}
                end

                review.update!(content: content, rating: rating, if_favorite: if_favorite, if_finished: if_finished)
                return {review: review, deleted: false}
            else
                raise ActiveRecord::RecordNotFound, "Review not found with the given ID, user ID, and media ID"
            end
        else
            if content.blank? && rating.blank? && !if_favorite && !if_finished
                raise GraphQL::ExecutionError, "ERROR IN CREATE REVIEW: ALL ARGUMENTS ARE REQUIRED"
            end
            new_review = new(
                user_id: user_id, 
                media_id: media_id, 
                content: content, 
                rating: rating, 
                if_favorite: if_favorite, 
                if_finished: if_finished
            )
            if new_review.save
                return {review: new_review, deleted: false}
            else
                raise ActiveRecord::RecordInvalid.new(new_review)
            end
        end
    end         

    scope :query_filter, ->(query) {
        if query.present?
            where("content ILIKE ?", "%#{query}%")
        end
    }
    scope :content_type_filter, ->(content_type) {
        if content_type != "all"
            where(media_id: Media.where(content_type: content_type).select(:id))
        end
    }
    scope :genre_filter, ->(genre) {
        where(media_id: Media.genre_filter(genre).select(:id))
    }

    def self.search(query:, embedded_query:, search_filter:, current_user_id:)
        base_search = Review.semantic_search(query, "review", embedded_query)
            .where.not(content: nil)
            .where(user_id: User.visible_to(current_user_id).select(:id))
        base_search = base_search.sort_by_trending unless query.present?
        if search_filter.present?
            search_filter.each do |filter|
                normalized_values = Array(filter.values).map(&:downcase)
                case filter.filter
                    when "content_type"
                        base_search = base_search.content_type_filter(normalized_values)
                    when "genre"
                        base_search = base_search.genre_filter(normalized_values)
                end
            end
        end

        return base_search.recent.includes(:user, :media, :review_comments, :review_likes).with_attached_images
    end

    def self.obtain_review_likes_page(user, content_type, query, page_num, limit)
        reviews = Review.where(id: ReviewLike.where(user_id: user.id).select(:review_id))
                        .includes(:user, :media, :review_comments, :review_likes)
                        .with_attached_images
                        .semantic_search(query, "review", nil)
                        .recent
        if content_type != "all"
            reviews = reviews.joins(:media).where(media: { content_type: content_type })
        end
        total_count = reviews.count
        total_pages = (total_count.to_f / limit).ceil
        return {
            reviews: reviews.page(page_num, limit),
            user: user,
            page_info: {
                total_pages: total_pages,
                total_count: total_count
            }
        }
    end
end

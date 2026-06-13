class Review < ApplicationRecord
    include SharedScopeMethods

    # POSSIBLY NEED ADJUSTMENT (higher = lax, lower = strict)
    belongs_to :user
    belongs_to :media

    has_many :review_comments, dependent: :delete_all
    has_many :review_likes, dependent: :delete_all

    has_many :activities, -> { where(activity_type: "Review") }, foreign_key: :activity_id, dependent: :delete_all

    validates :content, length: { maximum: 5000 }
    validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
    validates :if_favorite, inclusion: { in: [true, false] }
    validates :if_finished, inclusion: { in: [true, false] }

    # guarentees that a review is unique for a user and a media
    validates :user_id, uniqueness: { scope: :media_id }

    has_many_attached :images

    has_neighbors :embedding


    after_save :enqueue_embedding, if: :saved_change_to_content?
    after_save :enqueue_review_summary, if: :saved_change_to_content?

    private
    def enqueue_embedding
        AssignEmbeddingJob.perform_later(self.id, "review")
    end

    def enqueue_review_summary
        GenerateReviewSummaryJob.perform_later(self.media_id)
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

    scope :sort_by_trending, -> {
        select(<<~SQL
            reviews.*,
            (
                (SELECT COUNT(*) FROM review_likes WHERE review_likes.review_id = reviews.id)
                +
                (SELECT COUNT(*) FROM review_comments WHERE review_comments.review_id = reviews.id)
                * 2
            ) 
            AS trending_score
        SQL
        )
        .order("trending_score DESC")
        .includes(:user, :media)
    }

    # updates review if review_id is provided, otherwise creates a new review
    def self.update_review(user_id, media_id, content, rating, if_favorite, if_finished, review_id)
        if review_id.present?
            review = includes(:review_comments, :review_likes).find_by(id: review_id, user_id: user_id, media_id: media_id)
            if review.present?
                # if content is removed, delete all comments and likes
                if content.blank?
                    comment_ids = review.review_comments.map(&:id)
                    like_ids = review.review_likes.map(&:id)
                    review.review_comments.delete_all
                    review.review_likes.delete_all

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
        where(media_id: Media.where(content_type: content_type).select(:id))
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

        return base_search.recent.includes(:user, :media)
    end

end

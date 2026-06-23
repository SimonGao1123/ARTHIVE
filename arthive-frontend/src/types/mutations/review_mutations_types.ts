import type { UserReview } from "@/types/domain/review"
import type { ReviewComment } from "@/types/domain/comment"

export type CreateReviewInput = {
    input: {
        mediaId: number
        content?: string
        rating?: number
        ifFavorite: boolean
        ifFinished: boolean
    }
}

export type CreateReviewResponse = {
    createReview: {
        review: UserReview | null
        deleted: boolean
    }
}

export type LikeReviewInput = {
    input: {
        reviewId: number
    }
}

export type LikeReviewResponse = {
    likeReview: boolean
}

export type WriteCommentInput = {
    input: {
        reviewId: string
        comment: string
    }
}

export type WriteCommentResponse = {
    commentOnReview: ReviewComment
}

import type { AllReview, ReviewPage, UserReview, Review } from "@/types/domain/review"

export type ObtainAllUserReviewsResponse = {
    obtainAllUserReviews: {
        reviews: AllReview[]
        user: {
            id: string
            username: string
        }
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type ObtainAllUserReviewsInput = {
    userId: string
    contentType: "book" | "film" | "series" | "game" | "all"
    pageNum: number
    limit: number
    query: string | null
}

export type ObtainUserReviewResponse = {
    obtainUserReview: UserReview
}

export type ObtainUserReviewInput = {
    mediaId: number
}

export type ObtainReviewPageResponse = {
    obtainReviewPage: ReviewPage
}

export type ObtainReviewPageInput = {
    reviewId: string
    first: number
    after: string | null
    query: string | null
}

export type ReviewsMediaSortEnum = "newest" | "trending"

export type ObtainMediaReviewsResponse = {
    obtainMediaReviews: Review[]
}

export type ObtainMediaReviewsInput = {
    mediaId: number
    pageNum: number
    limit: number
    query: string
    after: string | null
    first: number
    sortBy: ReviewsMediaSortEnum
}

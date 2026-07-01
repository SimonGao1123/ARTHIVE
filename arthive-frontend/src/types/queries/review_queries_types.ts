import type { AllReview, ReviewPage, UserReview, Review } from "@/types/domain/review"
import type { User } from "@/types/domain/user"

// -------------- Trending Reviews Query --------------

export type ObtainTrendingReviewsResponse = {
    obtainTrendingReviews: {
        edges: { node: Review }[]
        pageInfo: {
            startCursor: string | null
            endCursor: string | null
            hasNextPage: boolean
            hasPreviousPage: boolean
        }
    }
}

export type ObtainTrendingReviewsInput = {
    contentType: "book" | "film" | "series" | "game" | "all"
    first?: number | null
    after?: string | null
    last?: number | null
    before?: string | null
}
// ────────────── OBTAIN_ALL_USER_REVIEWS_QUERY ──────────────

export type ObtainAllUserReviewsResponse = {
    obtainAllUserReviews: {
        reviews: AllReview[]
        user: User
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type ObtainAllUserReviewsInput = {
    userId: string
    contentType?: "book" | "film" | "series" | "game" | "all"
    pageNum?: number
    limit?: number
    query?: string | null
}

// ────────────── OBTAIN_USER_REVIEW_QUERY ──────────────

export type ObtainUserReviewResponse = {
    obtainUserReview: UserReview | null
}

export type ObtainUserReviewInput = {
    mediaId: number
}

// ────────────── OBTAIN_REVIEW_PAGE_QUERY ──────────────

export type ObtainReviewPageResponse = {
    obtainReviewPage: ReviewPage
}

export type ObtainReviewPageInput = {
    reviewId: string
    first?: number
    after?: string | null
    query?: string | null
}

// ────────────── OBTAIN_MEDIA_REVIEWS_QUERY ──────────────

export type ReviewsMediaSortEnum = "newest" | "trending"

export type ObtainMediaReviewsResponse = {
    obtainMediaReviews: {
        edges: { node: Review }[]
        pageInfo: {
            endCursor: string | null
            hasNextPage: boolean
        }
    }
}

export type ObtainMediaReviewsInput = {
    mediaId: number
    query?: string | null
    after?: string | null
    first?: number
    sortBy?: ReviewsMediaSortEnum
}

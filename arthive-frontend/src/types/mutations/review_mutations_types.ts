// Inline the exact selection sets from apollo/mutations/review_mutations.ts.
// Don't reuse domain types — the mutations pick strict subsets.

type UserSummary = {
    id: string
    username: string
    profilePicture: string | null
}

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
        review: {
            id: string
            content: string | null
            rating: number | null
            ifFavorite: boolean
            ifFinished: boolean
        } | null
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
    commentOnReview: {
        id: string
        comment: string
        createdAt: string
        user: UserSummary
    }
}

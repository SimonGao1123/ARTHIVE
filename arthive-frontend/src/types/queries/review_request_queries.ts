import { gql } from "@apollo/client"
import type { AllReview, ReviewPage } from "../review_type"
import type { UserReview } from "../review_type"

export const OBTAIN_ALL_USER_REVIEWS_QUERY = gql`
    query ObtainAllUserReviews($userId: ID!, $contentType: String, $pageNum: Int, $limit: Int, $query: String) {
        obtainAllUserReviews(userId: $userId, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
            reviews {
                id
                content
                rating
                ifFavorite
                ifFinished
                updatedAt

                media {
                    id
                    title
                    coverImage
                    creator
                    year
                    genre
                    contentType
                }
                likeCount
                commentCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
            }
            user {
                id
                username
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

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

export const OBTAIN_USER_REVIEW_QUERY = gql`
    query ObtainUserReview($mediaId: Int!) {
        obtainUserReview(mediaId: $mediaId) {
            id
            content
            rating
            ifFavorite
            ifFinished
            imageDetails {
                signedId
                url
            }
        }
    }
`
export type ObtainUserReviewResponse = {
    obtainUserReview: UserReview
}
export type ObtainUserReviewInput = {
    mediaId: number
}

export const OBTAIN_REVIEW_PAGE_QUERY = gql`
    query ObtainReviewPage($reviewId: ID!, $first: Int, $after: String, $query: String) {
        obtainReviewPage(reviewId: $reviewId, query: $query) {
            review {
                id
                content
                rating
                ifFavorite
                ifFinished
                updatedAt
                
                user {
                    id
                    username
                    profilePicture
                }

                media {
                    id
                    title
                    coverImage
                    creator
                    year
                    genre
                    contentType
                }

                likeCount
                commentCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
            }

            reviewComments(first: $first, after: $after) {
                edges {
                    node {
                        id
                        comment
                        createdAt

                        user {
                            id
                            username
                            profilePicture
                        }
                    }
                }
                
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }
`

export type ObtainReviewPageResponse = {
    obtainReviewPage: ReviewPage
}
export type ObtainReviewPageInput = {
    reviewId: string
    first: number
    after: string | null
    query: string | null
}
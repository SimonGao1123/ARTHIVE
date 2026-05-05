import { gql } from "@apollo/client"
import type { AllReview, ReviewPage } from "../review_type"
import type { UserReview } from "../review_type"

export const OBTAIN_ALL_USER_REVIEWS_QUERY = gql`
    query ObtainAllUserReviews($userId: ID!, $pageNum: Int!, $limit: Int!, $contentType: String!) {
        obtainAllUserReviews(userId: $userId, pageNum: $pageNum, limit: $limit, contentType: $contentType) {
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
            }
            user {
                id
                username
                
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
    }
    
}
export type ObtainAllUserReviewsInput = {
    userId: string
    pageNum: number
    limit: number
    contentType: "book" | "film" | "series" | "game" | "all"
}

export const OBTAIN_USER_REVIEW_QUERY = gql`
    query ObtainUserReview($mediaId: Int!) {
        obtainUserReview(mediaId: $mediaId) {
            id
            content
            rating
            ifFavorite
            ifFinished
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
    query ObtainReviewPage($reviewId: ID!, $pageNum: Int!, $limit: Int!) {
        obtainReviewPage(reviewId: $reviewId, pageNum: $pageNum, limit: $limit) {
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
            
            }

            reviewComments {
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
    }
`

export type ObtainReviewPageResponse = {
    obtainReviewPage: ReviewPage
}
export type ObtainReviewPageInput = {
    reviewId: string
    pageNum: number
    limit: number
}
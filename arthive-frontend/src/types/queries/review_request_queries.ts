import { gql } from "@apollo/client"
import type { AllReview } from "../review_type"
import type { UserReview } from "../review_type"

export const OBTAIN_ALL_USER_REVIEWS_QUERY = gql`
    query ObtainAllUserReviews($pageNum: Int!, $limit: Int!, $contentType: String!) {
        obtainAllUserReviews(pageNum: $pageNum, limit: $limit, contentType: $contentType) {
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
    }
`

export type ObtainAllUserReviewsResponse = {
    obtainAllUserReviews: AllReview[]
}
export type ObtainAllUserReviewsInput = {
    pageNum: number
    limit: number
    contentType: "book" | "film" | "series" | "all"
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
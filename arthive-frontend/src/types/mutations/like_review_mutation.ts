import { gql } from "@apollo/client"

export const LIKE_REVIEW_MUTATION = gql`
    mutation LikeReview($input: LikeReviewInput!) {
        likeReview(input: $input)
    }
`
export type LikeReviewInput = {
    input: {
        reviewId: number
    }
}
export type LikeReviewResponse = {
    likeReview: boolean
}
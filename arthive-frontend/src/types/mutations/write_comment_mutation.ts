import {gql} from "@apollo/client"
import type { ReviewComment } from "../comment_type"

export const WRITE_COMMENT_MUTATION = gql`
    mutation commentOnReview ($input: CommentOnReviewInput!) {
        commentOnReview(input: $input) {
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
`

export type WriteCommentInput = {
    input: {
        reviewId: string
        comment: string
    }
}
export type WriteCommentResponse = {
    commentOnReview: ReviewComment
}
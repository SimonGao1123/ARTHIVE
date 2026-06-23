import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    CreateReviewInput, CreateReviewResponse,
    LikeReviewInput, LikeReviewResponse,
    WriteCommentInput, WriteCommentResponse,
} from "@/types/mutations/review_mutations_types"
export const CREATE_REVIEW_MUTATION: TypedDocumentNode<CreateReviewResponse, CreateReviewInput> = gql`
    mutation createReview($input: CreateReviewInput!) {
        createReview(input: $input) {
            review {
                id
                content
                rating
                ifFavorite
                ifFinished
            }
            deleted
        }
    }
`

export const LIKE_REVIEW_MUTATION: TypedDocumentNode<LikeReviewResponse, LikeReviewInput> = gql`
    mutation LikeReview($input: LikeReviewInput!) {
        likeReview(input: $input)
    }
`
export const WRITE_COMMENT_MUTATION: TypedDocumentNode<WriteCommentResponse, WriteCommentInput> = gql`
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
import { gql } from "@apollo/client";
import type { UserReview } from "../review_type";

export const CREATE_REVIEW_MUTATION = gql`
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

export type CreateReviewInput = {
    input: {
        mediaId: number,
        content?: string,
        rating?: number,
        ifFavorite: boolean,
        ifFinished: boolean
    }
}

export type CreateReviewResponse = {
    createReview: {
        review: UserReview | null,
        deleted: boolean,
    }
}
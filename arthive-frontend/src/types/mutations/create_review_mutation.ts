import { gql } from "@apollo/client";

export const CREATE_REVIEW_MUTATION = gql`
    mutation CreateReview($input: CreateReviewInput!) {
        createReview(input: $input) {
            id
            content
            rating
            ifFavorite
            ifFinished
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
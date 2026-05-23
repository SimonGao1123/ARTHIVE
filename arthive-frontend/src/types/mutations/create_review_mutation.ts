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

export const REMOVE_ATTACHED_IMAGE_MUTATION = gql`
    mutation RemoveAttachedImage($input: RemoveAttachedImageInput!) {
        removeAttachedImage(input: $input)
    }
`

export type RemoveAttachedImageInput = {
    input: {
        signedIds: string[],
        resourceId: number,
        resourceType: "review" | "user" | "media",
    }
}

export type RemoveAttachedImageResponse = {
    removeAttachedImage: boolean
}
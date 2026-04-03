import { gql } from "@apollo/client"
import type { UserReview } from "../review_type"
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
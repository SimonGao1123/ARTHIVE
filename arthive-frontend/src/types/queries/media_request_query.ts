import { gql } from "@apollo/client"
import type { Media } from "../media_type"
import type { Review } from "../review_type"

// returns the media for the explore page, only need cover image for now
export const EXPLORE_PAGE_MEDIA_QUERY = gql`

    query ExplorePageMedia($contentType: String, $limit: Int, $pageNum: Int) {
        exploreMedia(contentType: $contentType, limit: $limit, pageNum: $pageNum) {
            media {
                id
                coverImage
            }
            ifPrevPage
            ifNextPage
            pageNum
        }
    }
`

export type ExplorePageMediaResponse = {
    exploreMedia: {
        media: {
            id: number
            coverImage: string
        }[]
        ifPrevPage: boolean
        ifNextPage: boolean
        pageNum: number
    }[]
}
export type ExplorePageMediaInput = {
    contentType: "book" | "film" | "series" | "all"
    limit: number
    pageNum: number
}

export const OBTAIN_MEDIA_INFO_QUERY = gql`
    query ObtainMediaInfo($mediaId: Int!) {
        obtainMediaInfo(mediaId: $mediaId) {
            id
            title
            creator
            year
            contentType
            language
            summary
            genre
            ongoing
            actors
            pageCount
            seriesTitle
            organization
            coverImage
        }
    }
`
export type ObtainMediaInfoResponse = {
    obtainMediaInfo: Media
}
export type ObtainMediaInfoInput = {
    mediaId: number
}

export type ObtainMediaReviewsResponse = {
    obtainMediaReviews: Review[]
}
export type ObtainMediaReviewsInput = {
    mediaId: number
    pageNum: number
    limit: number
}

export const OBTAIN_MEDIA_REVIEWS_QUERY = gql`
    query ObtainMediaReviews($mediaId: Int!, $pageNum: Int!, $limit: Int!) {
        obtainMediaReviews(mediaId: $mediaId, pageNum: $pageNum, limit: $limit) {
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
        }
    }
`;
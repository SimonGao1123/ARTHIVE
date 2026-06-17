import { gql } from "@apollo/client"
import type { Media } from "../media_type"
import type { Review } from "../review_type"

// returns the media for the explore page, only need cover image for now
export const NEWEST_EXPLORE_PAGE_MEDIA_QUERY = gql`
    query NewestExploreMedia($contentType: ContentTypeEnum, $first: Int, $after: String, $last: Int, $before: String) {
        newestExploreMedia(contentType: $contentType, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    coverImage
                    contentType
                    ifFavorite
                    ifFinished
                }
            }
            pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
            }
        }
    }
`

export type NewestExplorePageMediaResponse = {
    newestExploreMedia: {
        edges: {
            node: {
                id: number
                coverImage: string
                contentType: string
                ifFavorite: boolean
                ifFinished: boolean
            }
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
            hasPreviousPage: boolean
            startCursor: string
        }
    }
}

export type NewestExplorePageMediaInput =
    | { contentType: "book" | "film" | "series" | "game" | "all"; first: number; after?: string; last?: never; before?: never }
    | { contentType: "book" | "film" | "series" | "game" | "all"; last: number; before?: string; first?: never; after?: never }

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
            reviewsAiSummary
            reviewCount

            inLists {
                id
                name
            }
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
    query: string
    after: string | null
    first: number
    sortBy: ReviewsMediaSortEnum
}
export type ReviewsMediaSortEnum = "newest" | "trending"
export const OBTAIN_MEDIA_REVIEWS_QUERY = gql`
    query ObtainMediaReviews($mediaId: Int!, $query: String, $first: Int, $after: String, $sortBy: ReviewsMediaSortEnum) {
        obtainMediaReviews(mediaId: $mediaId, query: $query, first: $first, after: $after, sortBy: $sortBy) {
            edges {
                node {
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
                    likeCount
                    commentCount
                    ifLiked
                    imageDetails {
                        signedId
                        url
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const HOTTEST_EXPLORE_PAGE_MEDIA_QUERY = gql`
    query HottestExploreMedia($contentType: ContentTypeEnum, $first: Int, $after: String, $last: Int, $before: String) {
        hottestExploreMedia(contentType: $contentType, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    coverImage
                    contentType
                    ifFavorite
                    ifFinished
                }
            }

            pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
            }
        }
    }
`;
export type HottestExplorePageMediaResponse = {
    hottestExploreMedia: {
        edges: {
            node: {
                id: number
                coverImage: string
                contentType: string
                ifFavorite: boolean
                ifFinished: boolean
            }
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
            hasPreviousPage: boolean
            startCursor: string
        }
    }
}
export type HottestExplorePageMediaInput =
    | { contentType: "book" | "film" | "series" | "game" | "all"; first: number; after?: string; last?: never; before?: never }
    | { contentType: "book" | "film" | "series" | "game" | "all"; last: number; before?: string; first?: never; after?: never }

import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    NewestExplorePageMediaInput, NewestExplorePageMediaResponse,
    ObtainMediaInfoInput, ObtainMediaInfoResponse,
    HottestExplorePageMediaInput, HottestExplorePageMediaResponse,
    BecauseOfReviewsExploreMediaInput, BecauseOfReviewsExploreMediaResponse,
    ObtainFinishedMediaInput, ObtainFinishedMediaResponse,
    SearchMediaForListInput, SearchMediaForListResponse,
} from "@/types/queries/media_queries_types"
// returns the media for the explore page, only need cover image for now
export const NEWEST_EXPLORE_PAGE_MEDIA_QUERY: TypedDocumentNode<NewestExplorePageMediaResponse, NewestExplorePageMediaInput> = gql`
    query NewestExploreMedia($contentType: ContentTypeEnum, $first: Int, $after: String, $last: Int, $before: String) {
        newestExploreMedia(contentType: $contentType, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    coverImage
                    contentType
                    ifFavorite
                    ifFinished
                    favoriteCount
                    averageRating
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

export const OBTAIN_MEDIA_INFO_QUERY: TypedDocumentNode<ObtainMediaInfoResponse, ObtainMediaInfoInput> = gql`
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
            favoriteCount
            averageRating
            inLists {
                id
                name
            }
        }
    }
`
export const HOTTEST_EXPLORE_PAGE_MEDIA_QUERY: TypedDocumentNode<HottestExplorePageMediaResponse, HottestExplorePageMediaInput> = gql`
    query HottestExploreMedia($contentType: ContentTypeEnum, $first: Int, $after: String, $last: Int, $before: String) {
        hottestExploreMedia(contentType: $contentType, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    coverImage
                    contentType
                    ifFavorite
                    ifFinished
                    favoriteCount
                    averageRating
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


export const BECAUSE_OF_REVIEWS_EXPLORE_MEDIA_QUERY: TypedDocumentNode<BecauseOfReviewsExploreMediaResponse, BecauseOfReviewsExploreMediaInput> = gql`
    query BecauseOfReviewsExploreMedia($contentType: ContentTypeEnum, $first: Int, $after: String, $last: Int, $before: String) {
        becauseOfReviewsExploreMedia(contentType: $contentType) {
            media(first: $first, after: $after, last: $last, before: $before) {
                edges {
                    node {
                        id
                        coverImage
                        contentType
                        ifFavorite
                        ifFinished
                        favoriteCount
                        averageRating
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                    hasPreviousPage
                    startCursor
                }
            }
            source {
                id
                title
                contentType
            }
        }
    }
`;

export const OBTAIN_FINISHED_MEDIA_QUERY: TypedDocumentNode<ObtainFinishedMediaResponse, ObtainFinishedMediaInput> = gql`
    query ObtainFinishedMedia($userId: ID!, $contentType: ContentTypeEnum!, $pageNum: Int, $limit: Int, $query: String) {
        obtainFinishedMedia(userId: $userId, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
            user {
                id
                username
            }
            media {
                id
                title
                creator
                year
                genre
                contentType
                coverImage
                ifFavorite
                ifFinished
                favoriteCount
                averageRating
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

export const SEARCH_MEDIA_FOR_LIST_QUERY: TypedDocumentNode<SearchMediaForListResponse, SearchMediaForListInput> = gql`
    query SearchMediaForList($query: String!, $listId: ID!, $first: Int, $after: String) {
        searchMediaForList(query: $query, listId: $listId, first: $first, after: $after) {
            edges {
                node {
                    id
                    title
                    creator
                    year
                    contentType
                    coverImage
                    ifFavorite
                    ifFinished
                    averageRating
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`
import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    ObtainMediaReviewsInput, ObtainMediaReviewsResponse,
    ObtainAllUserReviewsInput, ObtainAllUserReviewsResponse,
    ObtainUserReviewInput, ObtainUserReviewResponse,
    ObtainReviewPageInput, ObtainReviewPageResponse,
} from "@/types/queries/review_queries_types"
export const OBTAIN_MEDIA_REVIEWS_QUERY: TypedDocumentNode<ObtainMediaReviewsResponse, ObtainMediaReviewsInput> = gql`
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


export const OBTAIN_ALL_USER_REVIEWS_QUERY: TypedDocumentNode<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput> = gql`
    query ObtainAllUserReviews($userId: ID!, $contentType: String, $pageNum: Int, $limit: Int, $query: String) {
        obtainAllUserReviews(userId: $userId, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
            reviews {
                id
                content
                rating
                ifFavorite
                ifFinished
                updatedAt

                media {
                    id
                    title
                    coverImage
                    creator
                    year
                    genre
                    contentType
                }
                likeCount
                commentCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
            }
            user {
                id
                username
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`


export const OBTAIN_USER_REVIEW_QUERY: TypedDocumentNode<ObtainUserReviewResponse, ObtainUserReviewInput> = gql`
    query ObtainUserReview($mediaId: Int!) {
        obtainUserReview(mediaId: $mediaId) {
            id
            content
            rating
            ifFavorite
            ifFinished
            imageDetails {
                signedId
                url
            }
        }
    }
`

export const OBTAIN_REVIEW_PAGE_QUERY: TypedDocumentNode<ObtainReviewPageResponse, ObtainReviewPageInput> = gql`
    query ObtainReviewPage($reviewId: ID!, $first: Int, $after: String, $query: String) {
        obtainReviewPage(reviewId: $reviewId, query: $query) {
            review {
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

                media {
                    id
                    title
                    coverImage
                    creator
                    year
                    genre
                    contentType
                }

                likeCount
                commentCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
            }

            reviewComments(first: $first, after: $after) {
                edges {
                    node {
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
                
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }
`
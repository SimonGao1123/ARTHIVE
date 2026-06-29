import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    ObtainCommunityInput, ObtainCommunityResponse,
    ObtainThreadInput, ObtainThreadResponse,
    ObtainTrendingThreadsInput, ObtainTrendingThreadsResponse,
} from "@/types/queries/thread_queries_types"


export const OBTAIN_COMMUNITY_QUERY: TypedDocumentNode<ObtainCommunityResponse, ObtainCommunityInput> = gql`
    query ObtainCommunity($mediaId: ID!, $first: Int, $after: String, $query: String) {
        obtainCommunity(mediaId: $mediaId) {
            id
            media {
                id
                title
                year
                creator
                coverImage
            }
            rootThreads(first: $first, after: $after, query: $query) {
                edges {
                    node {
                        id
                        title
                        content
                        createdAt
                        updatedAt
                        user {
                            id
                            username
                            profilePicture
                        }
                        likesCount
                        childThreadsCount
                        ifLiked
                        imageDetails {
                            signedId
                            url
                        }
                        hasReview
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
                            }
                            likeCount
                            commentCount
                            ifLiked
                            imageDetails {
                                signedId
                                url
                            }
                        }
                        parentThreadId
                        rootThreadId
                        depth

                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
`



export const OBTAIN_THREAD_QUERY: TypedDocumentNode<ObtainThreadResponse, ObtainThreadInput> = gql`
    query ObtainThread($threadId: ID!, $after: String, $first: Int) {
        obtainThread(threadId: $threadId) {
            id
            content
            title
            createdAt
            
            user {
                id
                username
                profilePicture
            }
            
            community {
                id
                media {
                    coverImage
                    title
                }
            }
            parentThreadId
            rootThreadId
            depth

            likesCount
            ifLiked
            childThreadsCount

            imageDetails {
                signedId
                url
            }

            hasReview
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
                }
                likeCount
                commentCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
            }

            childThreads(after: $after, first: $first) {
                edges {
                    node {
                        parentThreadId
                        rootThreadId
                        depth
                        id
                        content
                        title
                    
                        user {
                            profilePicture
                            id
                            username
                        }
                        createdAt
                        likesCount
                        ifLiked
                        childThreadsCount
                        imageDetails {
                            signedId
                            url
                        }
                        hasReview
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
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }
`

export const OBTAIN_TRENDING_THREADS_QUERY: TypedDocumentNode<ObtainTrendingThreadsResponse, ObtainTrendingThreadsInput> = gql`
    query ObtainTrendingThreads($limit: Int, $mediaIdScope: ID) {
        obtainTrendingThreads(limit: $limit, mediaIdScope: $mediaIdScope) {
            id
            title
            content
            createdAt
            updatedAt
            user {
                id
                username
                profilePicture
            }
            community {
                id
                media {
                    id
                    title
                    year
                    creator
                    coverImage
                }
            }
            likesCount
            childThreadsCount
            ifLiked
            imageDetails {
                signedId
                url
            }
            hasReview
            review {
                id
                content
                rating
                ifFavorite
                ifFinished
                updatedAt
                user { id username profilePicture }
                media { id title coverImage }
                likeCount
                commentCount
                ifLiked
                imageDetails { signedId url }
            }
            parentThreadId
            rootThreadId
        }
    }
`

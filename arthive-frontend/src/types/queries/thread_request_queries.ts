import { gql } from "@apollo/client"
import type { User } from "../user_types"
import type { CommunityThread } from "./community_request_queries"
import type { Community } from "./community_request_queries"  
import type { Review } from "../review_type"

export const OBTAIN_THREAD_QUERY = gql`
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
            
            likesCount
            ifLiked
            childThreadsCount

            imageDetails {
                signedId
                url
            }

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

export type ObtainThreadResponse = {
    obtainThread: {
        id: string
        content: string
        title: string
        createdAt: string
        user: User
        community: Community
        parentThreadId: string | null
        rootThreadId: string | null
        likesCount: number
        ifLiked: boolean
        childThreadsCount: number
        imageDetails: {
            signedId: string,
            url: string
        }[]
        review: Review
        childThreads: {
            edges: {
                node: CommunityThread
            } []
        }
    }
}
export type ObtainThreadInput = {
    threadId: string
    after: string | null
    first: number
}
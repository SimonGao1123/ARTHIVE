import { gql } from "@apollo/client"
import type { User } from "../user_types"
import type { CommunityThread } from "./community_request_queries"
import type { Community } from "./community_request_queries"  

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
            
            childThreads(after: $after, first: $first) {
                edges {
                    node {
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
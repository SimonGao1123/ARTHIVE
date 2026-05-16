import { gql } from "@apollo/client"
import type { User } from "../user_types"
export type CommunityThread = {
    id: string,
    title: string | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    user: User,
    likesCount: number,
    childThreadsCount: number,
    parentThreadId: string | null,
    rootThreadId: string | null,
    ifLiked: boolean,
    community: Community | null,
}
export type Community = {
    id: number,
    media: {
        id: string,
        title: string
        year: number
        creator: string
        coverImage: string
    }
}

export type ObtainCommunityResponse = {
    obtainCommunity: {
        id: number
        media: {
            id: string,
            title: string
            year: number
            creator: string
            coverImage: string
        }
        rootThreads: {
            edges: {
                node: CommunityThread
            } []
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
    }
}
export type ObtainCommunityInput = {
    mediaId: string,
    first: number,
    after: string,
    query: string | null,
}

export const OBTAIN_COMMUNITY_QUERY = gql`
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
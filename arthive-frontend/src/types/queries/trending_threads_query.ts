import { gql } from "@apollo/client"
import type { CommunityThread } from "./community_request_queries"

export type ObtainTrendingThreadsInput = {
    limit?: number
    mediaIdScope?: string | null
}

export type ObtainTrendingThreadsResponse = {
    obtainTrendingThreads: CommunityThread[]
}

export const OBTAIN_TRENDING_THREADS_QUERY = gql`
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

import { gql } from "@apollo/client"
import type { CommunityThread } from "../queries/community_request_queries"

export const LIKE_THREAD_MUTATION = gql`
    mutation LikeThread($input: LikeThreadInput!) {
        likeThread(input: $input)
    }
`
export type LikeThreadInput = {
    input: {
        threadId: string
    }
}
export type LikeThreadResponse = {
    likeThread: boolean
}
export const CREATE_THREAD_MUTATION = gql`
    mutation CreateThread($input: CreateThreadInput!) {
        createThread(input: $input) {
            id
            title
            content
            createdAt
            user {
                id
                username
                profilePicture
            }
            likesCount
            childThreadsCount
            ifLiked
            parentThreadId
            rootThreadId
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
            }
        }
    }
`
export type CreateThreadInput = {
    input: {
        communityId: string,
        content: string,
        title?: string,
        parentThreadId?: string,
        rootThreadId?: string
        reviewId?: string
    }
}
export type CreateThreadResponse = {
    createThread: CommunityThread
}
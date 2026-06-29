import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    LikeThreadInput, LikeThreadResponse,
    CreateThreadInput, CreateThreadResponse,
    EditThreadInput, EditThreadResponse,
} from "@/types/mutations/thread_mutations_types"

export const LIKE_THREAD_MUTATION: TypedDocumentNode<LikeThreadResponse, LikeThreadInput> = gql`
    mutation LikeThread($input: LikeThreadInput!) {
        likeThread(input: $input)
    }
`
export const CREATE_THREAD_MUTATION: TypedDocumentNode<CreateThreadResponse, CreateThreadInput> = gql`
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
            depth
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
export const EDIT_THREAD_MUTATION: TypedDocumentNode<EditThreadResponse, EditThreadInput> = gql`
    mutation EditThread($input: EditThreadInput!) {
        editThread(input: $input) {
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
            depth
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
            community {
                media {
                id
                title
                coverImage
                }
            }
        }
    }
`
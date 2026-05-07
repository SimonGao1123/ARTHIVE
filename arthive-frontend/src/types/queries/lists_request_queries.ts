import { gql } from "@apollo/client"
import type { User } from "../user_types"
export const OBTAIN_ALL_USER_LISTS_QUERY = gql`
    query ObtainAllUserLists($userId: ID!, $pageNum: Int!, $limit: Int!, $contentType: String!, $query: String) {
        obtainAllUserLists(userId: $userId, pageNum: $pageNum, limit: $limit, contentType: $contentType, query: $query) {
            lists {
                id
                name
                description
                contentType
                ifPrivate
                tags
                createdAt
                updatedAt

                mediaInLists(pageNum: 1, limit: 3) {
                    media {
                        id
                        coverImage
                    }
                }
            }
            pageInfo {
                totalPages
                totalCount
            }
            
            user {
                id
                username
                email
                profilePicture
                ifAdmin
                description
                visibility
            }
        }
    }
`

export type AllUserListType = {
    id: string,
    name: string,
    description: string | null,
    contentType: string[],
    ifPrivate: boolean,
    tags: string[],
    createdAt: string,
    updatedAt: string,

    mediaInLists: {
        media: {
            id: string,
            coverImage: string | null,
        }
    } []
}


export type ObtainAllUserListsInput = {
    userId: string,
    pageNum: number,
    limit: number,
    contentType: "book" | "film" | "series" | "game" | "all"
    query: string | null
}
export type ObtainAllUserListsResponse = {
    obtainAllUserLists: {
        user: User,
        lists: AllUserListType[],
        pageInfo: {
            totalPages: number,
            totalCount: number,
        }
    }
}
import { gql } from "@apollo/client"
import type { User } from "../user_types"
export const OBTAIN_ALL_USER_LISTS_QUERY = gql`
    query ObtainAllUserLists($userId: ID!, $pageNum: Int!, $limit: Int!, $contentType: String!, $query: String, $excludeMediaId: ID) {
        obtainAllUserLists(userId: $userId, pageNum: $pageNum, limit: $limit, contentType: $contentType, query: $query, excludeMediaId: $excludeMediaId) {
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
    excludeMediaId: string | null
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

export const OBTAIN_LIST_PAGE_QUERY = gql`
    query ObtainListPage($listId: ID!, $pageNum: Int!, $limit: Int!, $query: String) {
        obtainListPage(listId: $listId, pageNum: $pageNum, limit: $limit, query: $query) {
            list {
                id
                name
                description
                contentType
                ifPrivate
                tags
                createdAt
                updatedAt
            }
            mediaInLists {
                media {
                    id
                    coverImage
                    title
                }
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
            
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

export type ObtainListPageInput = {
    listId: string,
    pageNum: number,
    limit: number,
    query: string | null
}
export type ObtainListPageResponse = {
    obtainListPage: {
        list: {
            id: string,
            name: string,
            description: string | null,
            contentType: string[],
            ifPrivate: boolean,
            tags: string[],
            createdAt: string,
            updatedAt: string,
        }
        mediaInLists: {
            media: {
                id: string,
                coverImage: string | null,
                title: string,
            }
        } []
        user: User,
        pageInfo: {
            totalPages: number,
            totalCount: number,
        }
    }
}
export type ListType = {
    id: string,
    name: string,
    description: string | null,
    contentType: string[],
    ifPrivate: boolean,
    tags: string[],
    createdAt: string,
    updatedAt: string,
}
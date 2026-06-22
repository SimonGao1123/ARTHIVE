import { gql } from "@apollo/client"
import type { User } from "../user_types"
import type { Media } from "../media_type"
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
                ifEditable
                role
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
    ifEditable: boolean | null,
    role: string | null,
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
                likeCount
                ifLiked
                ifEditable
                role
                publicListMembers {
                    id
                    status
                    role
                    joinedAt
                    user { id username profilePicture }
                }
                allListMembers {
                    id
                    status
                    role
                    joinedAt
                    user { id username profilePicture }
                }
            }
            mediaInLists {
                media {
                    id
                    title
                    creator
                    year
                    genre
                    contentType
                    coverImage
                    ifFavorite
                    ifFinished
                    favoriteCount
                    averageRating
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
export type ListMemberSummary = {
    id: string
    status: "pending" | "accepted" | "rejected"
    role: "member" | "admin"
    joinedAt: string | null
    user: { id: string, username: string, profilePicture: string | null }
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
            likeCount: number,
            ifLiked: boolean,
            ifEditable: boolean | null,
            role: string | null,
            publicListMembers: ListMemberSummary[] | null,
            allListMembers: ListMemberSummary[] | null,
        }
        mediaInLists: {
            media: Media
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
    likeCount: number,
    ifLiked: boolean,
    user: User,
    mediaInLists: {
        media: Media
    } [],
    ifEditable: boolean | null,
    role: string | null,
    publicListMembers?: ListMemberSummary[] | null,
    allListMembers?: ListMemberSummary[] | null,
}

export const OBTAIN_TRENDING_LISTS_QUERY = gql`
    query ObtainTrendingLists($contentType: ContentTypeEnum!, $first: Int!, $after: String, $last: Int, $before: String) {
        obtainTrendingLists(contentType: $contentType, first: $first, after: $after, last: $last, before: $before) {
            edges {
                node {
                    id
                    name
                    tags
                    user {
                        id
                        username
                        profilePicture
                    }
                    ifLiked
                    likeCount
                    mediaInLists(pageNum: 1, limit: 3) {
                        media {
                            id
                            coverImage
                        }
                    }
                    ifEditable
                    role
                }
            }
            pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
            }
        }
    }
`

export type ObtainTrendingListsInput = {
    contentType: "book" | "film" | "series" | "game" | "all"
    first: number
    after: string | null
    last: number | null
    before: string | null
}
export type ObtainTrendingListsResponse = {
    obtainTrendingLists: {
        edges: {
            node: ListType
        } []
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
            hasPreviousPage: boolean
            startCursor: string | null
        }
    }
}
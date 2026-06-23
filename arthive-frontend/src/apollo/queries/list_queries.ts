import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    ObtainAllUserListsInput, ObtainAllUserListsResponse,
    ObtainListPageInput, ObtainListPageResponse,
    ObtainTrendingListsInput, ObtainTrendingListsResponse,
} from "@/types/queries/list_queries_types"

export const OBTAIN_ALL_USER_LISTS_QUERY: TypedDocumentNode<ObtainAllUserListsResponse, ObtainAllUserListsInput> = gql`
    query ObtainAllUserLists($userId: ID!, $pageNum: Int!, $limit: Int!, $contentType: String!, $query: String, $excludeMediaId: ID, $roleFilter: ListMemberRoleEnum) {
        obtainAllUserLists(userId: $userId, pageNum: $pageNum, limit: $limit, contentType: $contentType, query: $query, excludeMediaId: $excludeMediaId, roleFilter: $roleFilter) {
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

export const OBTAIN_LIST_PAGE_QUERY: TypedDocumentNode<ObtainListPageResponse, ObtainListPageInput> = gql`
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

export const OBTAIN_TRENDING_LISTS_QUERY: TypedDocumentNode<ObtainTrendingListsResponse, ObtainTrendingListsInput> = gql`
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
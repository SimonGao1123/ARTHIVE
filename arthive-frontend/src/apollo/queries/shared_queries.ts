import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    ObtainLikesPageInput, ObtainLikesPageResponse,
    ObtainNotificationsInput, ObtainNotificationsResponse,
    SearchBarInput, SearchBarResponse,
} from "@/types/queries/shared_queries_types"
// queries involving multiple types / unions

export const OBTAIN_LIKES_PAGE_QUERY: TypedDocumentNode<ObtainLikesPageResponse, ObtainLikesPageInput> = gql`
    query ObtainLikesPage($userId: ID!, $type: LikesPageDisplayTypeEnum!, $contentType: ContentTypeEnum!, $pageNum: Int, $limit: Int, $query: String) {
        obtainLikesPage(userId: $userId, type: $type, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
            user {
                id
                username
            }
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
            reviews {
                id
                content
                rating
                ifFavorite
                ifFinished
                createdAt
                commentCount
                likeCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
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
        }
    }
`


export const OBTAIN_NOTIFICATIONS_QUERY: TypedDocumentNode<ObtainNotificationsResponse, ObtainNotificationsInput> = gql`
    query ObtainNotifications ($after_unread: String, $first_unread: Int, $after_read: String, $first_read: Int, $filter: ObtainNotificationFilterEnum) {
        obtainNotifications (filter: $filter) {
            unreadNotificationsCount
            readNotificationsCount
            unreadNotifications (after: $after_unread, first: $first_unread) {
                edges {
                    node {
                        id
                        sender {
                            id
                            username
                            profilePicture
                            followFromCurrentUser {
                                id
                                status
                            }
                        }
                        action

                        createdAt

                        follow {
                            id
                            status
                            receiver {
                                id
                            }
                        }
                        review {
                            id
                            content
                            imageDetails {
                                url
                            }
                        }
                        reviewComment {
                            id
                            comment
                        }
                        parentThread {
                            id
                            content
                            title
                            imageDetails {
                                url
                            }
                            community {
                                id
                                media {
                                    id
                                    title
                                    coverImage
                                }
                            }
                        }
                        commentThread {
                            id
                            content
                            imageDetails {
                                url
                            }
                        }
                        list {
                            id
                            name
                        }
                        listMember {
                            id
                            list {
                                id
                                name
                            }
                            role
                            status
                            sentByUser {
                                id
                                username
                                profilePicture
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
            readNotifications (after: $after_read, first: $first_read) {
                edges {
                    node {
                        id
                        sender {
                            id
                            username
                            profilePicture
                            followFromCurrentUser {
                                id
                                status
                            }
                        }
                        action

                        createdAt

                        follow {
                            id
                            status
                        }
                        review {
                            id
                            content
                            imageDetails {
                                url
                            }
                        }
                        reviewComment {
                            id
                            comment
                        }
                        parentThread {
                            id
                            content
                            title
                            imageDetails {
                                url
                            }
                            community {
                                id
                                media {
                                    id
                                    title
                                    coverImage
                                }
                            }
                        }
                        commentThread {
                            id
                            content
                            imageDetails {
                                url
                            }
                        }
                        list {
                            id
                            name
                        }
                        listMember {
                            id
                            list {
                                id
                                name
                            }
                            role
                            status
                            sentByUser {
                                id
                                username
                                profilePicture
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

export const SEARCH_BAR_QUERY: TypedDocumentNode<SearchBarResponse, SearchBarInput> = gql`
    query SearchBar(
    $query: String!, 
    $searchType: SearchTypeEnum!, 
    $searchFilter: [SearchFilterInput!], 
    $after_medias: String, 
    $first_medias: Int, 
    $after_users: String, 
    $first_users: Int, 
    $after_reviews: String, 
    $first_reviews: Int, 
    $after_lists: String, 
    $first_lists: Int, 
    $after_threads: String, 
    $first_threads: Int
    ) {
        searchBar(query: $query, searchType: $searchType, searchFilter: $searchFilter) {
            medias(after: $after_medias, first: $first_medias) {
                edges {
                    node {
                        id
                        title
                        coverImage
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }

            users(after: $after_users, first: $first_users) {
                edges {
                    node {
                        id
                        username
                        profilePicture
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            reviews(after: $after_reviews, first: $first_reviews) {
                edges {
                    node {
                        id
                        content
                        rating
                        media {
                            id
                            title
                            coverImage
                        }
                        user {
                            id
                            username
                            profilePicture
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }

            lists(after: $after_lists, first: $first_lists) {
                edges {
                    node {
                        id
                        name
                        description
                        contentType
                        ifPrivate
                        tags
                        user {
                            id
                            username
                            profilePicture
                        }
                        mediaInLists(pageNum: 1, limit: 3) {
                            media {
                                coverImage
                            }
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            threads(after: $after_threads, first: $first_threads) {
                edges {
                    node {
                        id
                        title
                        content
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
                                coverImage
                            }
                        }
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

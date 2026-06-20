import { gql } from "@apollo/client"
import type { FollowData } from "./obtain_followers_query"
import type { User } from "../user_types"
import type { CommunityThread } from "./community_request_queries"
import type { ReviewComment, UserReview } from "../review_type"
export const OBTAIN_NOTIFICATIONS_QUERY = gql`
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

export type ReadNotificationsInput = {
    after_read: string | null
    first_read: number
    after_unread: string | null
    first_unread: number
    filter: ObtainNotificationFilterEnum 
}

export type ObtainNotificationFilterEnum = "all" | "follows" | "reviews" | "threads" | "quote_reviews" | "lists"
export type Notification = {
    id: string,
    sender: User & { followFromCurrentUser: { id: string, status: string } | null },
    action: string,
    createdAt: string,
    follow: FollowData,
    review: UserReview,
    reviewComment: ReviewComment,
    parentThread: CommunityThread,
    commentThread: CommunityThread,
    list: { id: string, name: string } | null,
}

export type ObtainNotificationsResponse = {
    obtainNotifications: {
        unreadNotificationsCount: number
        readNotificationsCount: number
        unreadNotifications: {
            edges: {
                node: Notification
            }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
        readNotifications: {
            edges: {
                node: Notification
            }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
    }
}

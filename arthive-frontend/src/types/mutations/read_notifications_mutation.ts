import { gql } from "@apollo/client"
import type { CommunityThread } from "../queries/community_request_queries"
import type { User } from "../user_types"
import type { FollowData } from "../queries/obtain_followers_query"
import type { UserReview } from "../review_type"
import type { ReviewComment } from "../review_type"

export const READ_NOTIFICATIONS_MUTATION = gql`
    mutation ReadNotifications ($after: String, $first: Int) {
        readNotifications (input: {}, after: $after, first: $first) {
            edges {
                node {
                    id
                    sender {
                        id
                        username
                        profilePicture

                    }
                    receiver {
                        id
                        username
                        profilePicture
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
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`
export type ReadNotificationsInput = {
    after: string | null
    first: number
}

export type Notification = {
    id: string,
    sender: User,
    receiver: User,
    action: string,
    createdAt: string,
    follow: FollowData,
    review: UserReview,
    reviewComment: ReviewComment,
    parentThread: CommunityThread,
    commentThread: CommunityThread,
}

export type ReadNotificationsResponse = {
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

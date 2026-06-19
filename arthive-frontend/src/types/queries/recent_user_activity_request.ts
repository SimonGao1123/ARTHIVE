import { gql } from "@apollo/client";

export const RECENT_USER_ACTIVITY_REQUEST = gql`
    query RecentUserActivity($userId: ID!, $after: String, $first: Int) {
        recentUserActivity(userId: $userId, after: $after, first: $first) {
            edges {
                node {
                    id
                    status
                    createdAt
                    activityType

                    activitySnapshot {
                        content
                        rating
                        ifFavorite
                        ifFinished
                        comment
                        reviewerUsername
                        title
                        threadContent
                        threadTitle
                        threadAuthorUsername
                        listName
                        label
                    }

                    subject {
                        __typename
                        ... on Review {
                            id
                            media { id coverImage title }
                        }
                        ... on ReviewComment {
                            id
                            review { id media { id coverImage title } }
                        }
                        ... on ReviewLike {
                            id
                            review { id media { id coverImage title } }
                        }
                        ... on CommunityThread {
                            id
                            community { media { id coverImage title } }
                        }
                        ... on ThreadLike {
                            id
                            communityThread {
                                id
                                community { media { id coverImage title } }
                            }
                        }
                        ... on List {
                            id
                        }
                        ... on ListLike {
                            id
                            list { id }
                        }
                        ... on MediaInList {
                            id
                            media { id coverImage title }
                            list { id }
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

export type ActivitySnapshot = {
    content: string | null
    rating: number | null
    ifFavorite: boolean | null
    ifFinished: boolean | null
    comment: string | null
    reviewerUsername: string | null
    title: string | null
    threadContent: string | null
    threadTitle: string | null
    threadAuthorUsername: string | null
    listName: string | null
    label: string | null
}

export type Activity = {
    id: string,
    status: string,
    createdAt: string,
    subject: any
    activityType: string
    activitySnapshot: ActivitySnapshot | null
}

export type RecentUserActivityResponse = {
    recentUserActivity: {
        edges: {
            node: Activity
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
        }
    }
}
export type RecentUserActivityInput = {
    userId: string,
    after: string | null,
    first: number
}

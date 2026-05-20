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

                    subject {
                        __typename
                        ... on Review {
                            id
                            content
                            rating
                            ifFavorite
                            ifFinished
                            updatedAt

                            media {
                                id
                                coverImage
                                title
                            }
                        }

                        ... on ReviewComment {
                            id
                            comment
                            review {
                                id
                                content
                                rating
                                ifFavorite
                                ifFinished
                                updatedAt

                                media {
                                    id
                                    coverImage
                                    title
                                }
                            }
                        }

                        ... on ReviewLike {
                            id
                            review {
                                id
                                content
                                rating
                                ifFavorite
                                ifFinished
                                updatedAt

                                media {
                                    id
                                    coverImage
                                    title
                                }
                            }
                        }

                        ... on CommunityThread {
                            id
                            title
                            content
                            createdAt
                            updatedAt

                            community {
                                id
                                media {
                                    id
                                    title
                                    coverImage
                                }
                            }
                        }

                        ... on ThreadLike {
                            id
                            communityThread {
                                id
                                title
                                content
                                createdAt
                                updatedAt

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

                        ... on List {
                            id
                            name
                            description
                        }
                        
                        ... on MediaInList {
                            id
                            media {
                                id
                                coverImage
                                title
                            }
                            list {
                                id
                                name
                                description
                            }
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

export type Activity = {
    id: string,
    status: string,
    createdAt: string,
    subject: any
    activityType: string
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
import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    WhoamiResponse,
    ListInvitationUserSearchInput, ListInvitationUserSearchResponse,
    RecentUserActivityInput, RecentUserActivityResponse,
    UserProfileQueryInput, UserProfileQueryResponse,
} from "@/types/queries/user_queries_types"
export const WHOAMI_QUERY: TypedDocumentNode<WhoamiResponse, Record<string, never>> = gql`
    query Whoami {
        whoami {
            id
            username
            email
            profilePicture
            ifAdmin
            description
            visibility
            notificationsCount
        }
    }
`
export const LIST_INVITATION_USER_SEARCH_QUERY: TypedDocumentNode<ListInvitationUserSearchResponse, ListInvitationUserSearchInput> = gql`
    query ListInvitationUserSearch($query: String!, $listId: ID!, $limit: Int) {
        listInvitationUserSearch(query: $query, listId: $listId, limit: $limit) {
            id
            username
            profilePicture
        }
    }
`

export const RECENT_USER_ACTIVITY_REQUEST: TypedDocumentNode<RecentUserActivityResponse, RecentUserActivityInput> = gql`
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

export const USER_PROFILE_QUERY: TypedDocumentNode<UserProfileQueryResponse, UserProfileQueryInput> = gql`
    query UserProfile($userId: ID!) {
        obtainUserProfile(userId: $userId) {
            user {
                id
                username
                visibility
                profilePicture
                description
                followersCount
                followingCount
                pendingSentFollowsCount
                pendingReceivedFollowsCount
            }
            isVisibleToUser
            currentOutgoingFollow {
                id
                status
            }
            currentIncomingFollow {
                id
                status
            }
            totalReviewsCount
            allFinishedCount
            allLikedCount
            totalListsCount
            totalCommunityThreadsCount
            filmReviewsCount
            seriesReviewsCount
            bookReviewsCount
            gameReviewsCount
            editAccess
        }
    }
`

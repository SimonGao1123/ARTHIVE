import type { User, WhoamiResponse } from "@/types/domain/user"

export type { WhoamiResponse }

// ────────────── LIST_INVITATION_USER_SEARCH_QUERY ──────────────

export type ListInvitationUserSearchInput = {
    query: string
    listId: string
    limit?: number
}

export type InvitableUser = Pick<User, "id" | "username" | "profilePicture">

export type ListInvitationUserSearchResponse = {
    listInvitationUserSearch: InvitableUser[]
}

// ────────────── RECENT_USER_ACTIVITY_REQUEST ──────────────

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
    id: string
    status: string
    createdAt: string
    subject: { __typename: string } & Record<string, unknown>
    activityType: string
    activitySnapshot: ActivitySnapshot | null
}

export type RecentUserActivityInput = {
    userId: string
    after: string | null
    first: number
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

// ────────────── USER_PROFILE_QUERY ──────────────

export type UserProfileQueryInput = {
    userId: string
}

export type UserProfileType = {
    user: {
        id: string
        username: string
        visibility: string
        profilePicture: string | null
        description: string | null

        followersCount: number
        followingCount: number
        pendingSentFollowsCount: number | null
        pendingReceivedFollowsCount: number | null
    }

    isVisibleToUser: boolean
    currentOutgoingFollow: {
        id: string
        status: string
    } | null
    currentIncomingFollow: {
        id: string
        status: string
    } | null
    totalReviewsCount: number | null
    allFinishedCount: number | null
    allLikedCount: number | null
    totalListsCount: number | null
    totalCommunityThreadsCount: number | null
    filmReviewsCount: number | null
    seriesReviewsCount: number | null
    bookReviewsCount: number | null
    gameReviewsCount: number | null
    editAccess: boolean
}

export type UserProfileQueryResponse = {
    obtainUserProfile: UserProfileType
}

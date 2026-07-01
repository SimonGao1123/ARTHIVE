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

// `activitySnapshot` fields are all nullable — different activityTypes populate
// different subsets.
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

// The query declares 9 inline fragments on `subject` — model each variant
// with the exact fields it selects. Consumers can discriminate on __typename.
type MediaRef = {
    id: string
    coverImage: string | null
    title: string
}

export type ActivitySubject =
    | { __typename: "Review"; id: string; media: MediaRef }
    | { __typename: "ReviewComment"; id: string; review: { id: string; media: MediaRef } }
    | { __typename: "ReviewLike"; id: string; review: { id: string; media: MediaRef } }
    | { __typename: "CommunityThread"; id: string; community: { media: MediaRef } }
    | { __typename: "ThreadLike"; id: string; communityThread: { id: string; community: { media: MediaRef } } }
    | { __typename: "List"; id: string }
    | { __typename: "ListLike"; id: string; list: { id: string } }
    | { __typename: "ListSave"; id: string; list: { id: string } }
    | { __typename: "MediaInList"; id: string; media: MediaRef; list: { id: string } }

export type Activity = {
    id: string
    status: string
    createdAt: string
    subject: ActivitySubject
    activityType: string
    activitySnapshot: ActivitySnapshot | null
}

export type RecentUserActivityInput = {
    userId: string
    after?: string
    first?: number
}

export type RecentUserActivityResponse = {
    recentUserActivity: {
        edges: { node: Activity }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
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

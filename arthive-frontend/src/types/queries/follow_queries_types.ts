// OBTAIN_INCOMING_FOLLOWS_QUERY selects `sender` on each follow.
// OBTAIN_OUTGOING_FOLLOWS_QUERY selects `receiver`. Both use this same
// response type, so both sides are optional here.

type UserSummary = {
    id: string
    username: string
    profilePicture: string | null
}

export type ObtainFollowersInput = {
    userId: string
    pageNum: number
    limit: number
    type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows"
    query?: string
}

// Incoming follows queries select `sender`; outgoing select `receiver`. Both
// fields are declared `| null` (always present as a key, one is populated
// per query direction).
export type FollowData = {
    id: string
    status: string
    updatedAt: string
    sender: UserSummary | null
    receiver: UserSummary | null
}

export type ObtainFollowersResponse = {
    obtainFollowerInfo: {
        user: UserSummary
        follows: FollowData[]
        count: number
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

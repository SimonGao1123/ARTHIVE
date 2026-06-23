export type ObtainFollowersInput = {
    userId: string
    pageNum: number
    limit: number
    type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows"
}

export type ObtainFollowersResponse = {
    obtainFollowerInfo: {
        user: {
            id: string
            username: string
            profilePicture: string
        }
        follows: FollowData[]
        count: number
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type FollowData = {
    id: string
    status: string
    updatedAt: string
    sender: {
        id: string
        username: string
        profilePicture: string
    } | null
    receiver: {
        id: string
        username: string
        profilePicture: string
    } | null
}

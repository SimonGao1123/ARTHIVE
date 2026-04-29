import { gql } from "@apollo/client"

export const OBTAIN_INCOMING_FOLLOWS_QUERY = gql`
    query ObtainIncomingFollows($userId: ID!, $pageNum: Int!, $limit: Int!, $type: FollowTypeEnum!) {
        obtainFollowerInfo(userId: $userId, pageNum: $pageNum, limit: $limit, type: $type) {
            user {
                id
                username
                profilePicture
            }
            follows {
                id
                status
                updatedAt

                sender {
                    id
                    username
                    profilePicture
                    
                }
            }
            count
        }
    }
`

export const OBTAIN_OUTGOING_FOLLOWS_QUERY = gql`
    query ObtainOutgoingFollows($userId: ID!, $pageNum: Int!, $limit: Int!, $type: FollowTypeEnum!) {
        obtainFollowerInfo(userId: $userId, pageNum: $pageNum, limit: $limit, type: $type) {
            user {
                id
                username
                profilePicture
            }
            follows {
                id
                status
                updatedAt

                receiver {
                    id
                    username
                    profilePicture
                    
                }
            }
            count
        }
    }
`

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
        follows: {
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
        }[]
        count: number
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

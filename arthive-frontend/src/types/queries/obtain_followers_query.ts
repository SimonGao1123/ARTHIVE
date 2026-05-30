import { gql } from "@apollo/client"

export const OBTAIN_INCOMING_FOLLOWS_QUERY = gql`
    query ObtainIncomingFollows($userId: ID!, $pageNum: Int!, $limit: Int!, $type: FollowTypeEnum!, $query: String) {
        obtainFollowerInfo(userId: $userId, pageNum: $pageNum, limit: $limit, type: $type, query: $query) {
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

            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

export const OBTAIN_OUTGOING_FOLLOWS_QUERY = gql`
    query ObtainOutgoingFollows($userId: ID!, $pageNum: Int!, $limit: Int!, $type: FollowTypeEnum!, $query: String) {
        obtainFollowerInfo(userId: $userId, pageNum: $pageNum, limit: $limit, type: $type, query: $query) {
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
            pageInfo {
                totalPages
                totalCount
            }
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

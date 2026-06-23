import { gql, type TypedDocumentNode } from "@apollo/client"
import type { ObtainFollowersInput, ObtainFollowersResponse } from "@/types/queries/follow_queries_types"

export const OBTAIN_INCOMING_FOLLOWS_QUERY: TypedDocumentNode<ObtainFollowersResponse, ObtainFollowersInput> = gql`
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

export const OBTAIN_OUTGOING_FOLLOWS_QUERY: TypedDocumentNode<ObtainFollowersResponse, ObtainFollowersInput> = gql`
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

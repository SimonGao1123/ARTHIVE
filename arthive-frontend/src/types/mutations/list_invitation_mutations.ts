import { gql } from "@apollo/client"
import type { ListType } from "../queries/lists_request_queries"
import type { User } from "../user_types"
export type ListMemberType = {
    id: string
    list: ListType
    user: User
    role: string
    status: string
    sentByUser: User
    joinedAt: string | null
}

export const ACCEPT_LIST_INVITE_MUTATION = gql`
    mutation AcceptListInvite($input: AcceptListInviteInput!) {
        acceptListInvite(input: $input) {
            id
            list {
                id
            }
            user {
                id
            }
            role
            status
            sentByUser {
                id
            }
            joinedAt
        }
    }
`

export type AcceptListInviteInput = {
    input: {
        listMemberId: string,
        accept: boolean
    }
}

export type AcceptListInviteResponse = {
    acceptListInvite: ListMemberType
}

export const INVITE_USER_TO_LIST_MUTATION = gql`
    mutation InviteUserToList($input: InviteUserToListInput!) {
        inviteUserToList(input: $input) {
            id
            list {
                id
            }
            user {
                id
            }
            role
            status
            sentByUser {
                id
            }
            joinedAt
        }
    }
`

export type InviteUserToListInput = {
    input: {
        listId: string
        userId: string
        role: "member" | "admin"
    }
}

export type InviteUserToListResponse = {
    inviteUserToList: ListMemberType
}
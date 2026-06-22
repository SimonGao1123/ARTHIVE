import { gql } from "@apollo/client"
import type { ListMemberType } from "./list_invitation_mutations"

export const ALTER_LIST_MEMBERSHIP_MUTATION = gql`
    mutation AlterListMembership($input: AlterListMembershipInput!) {
        alterListMembership(input: $input) {
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

export type AlterListMembershipInput = {
    input: {
        listMemberId: string
        action: "remove" | "change_role"
        role: "member" | "admin" | null
        listId: string
    }
}

export type AlterListMembershipResponse = {
    alterListMembership: ListMemberType
}
import { gql } from "@apollo/client"

export const RESPOND_TO_LIST_INVITE_MUTATION = gql`
    mutation RespondToListInvite($input: RespondToListInviteInput!) {
        respondToListInvite(input: $input) {
            id
            status
            role
        }
    }
`

export type RespondToListInviteInput = {
    input: {
        listMemberId: string
        accept: boolean
    }
}

export type RespondToListInviteResponse = {
    respondToListInvite: {
        id: string
        status: string
        role: string
    }
}

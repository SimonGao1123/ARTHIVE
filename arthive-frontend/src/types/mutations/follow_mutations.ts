import { gql } from "@apollo/client"

type follow_mutation_base = {
    id: string
    status: string
    receiver: {
        id: string
        username: string
    }
    sender: {
        id: string
        username: string
    }
}
export const SEND_FOLLOW_MUTATION = gql`
    mutation SendFollow($input: SendFollowInput!) {
        sendFollow(input: $input) {
        id
        status
        receiver {
            id
            username
        }
        sender {
            id
            username
        }
    }
}
`

export type SendFollowInput = {
    input: {
        receiverId: string
    }
}

export type SendFollowResponse = {
    sendFollow: follow_mutation_base
}

export const MANIPULATE_FOLLOW_MUTATION = gql`
    mutation ManipulateFollow($input: ManipulateFollowInput!) {
        manipulateFollow(input: $input) {
            id
            status
            receiver {
                id
                username
            }
            sender {
                id
                username
            }
        }
    }
`
export type ManipulateFollowInput = {
    input: {
        followId: string
        manipulation: string
    }
}
export type ManipulateFollowResponse = {
    manipulateFollow: follow_mutation_base
}

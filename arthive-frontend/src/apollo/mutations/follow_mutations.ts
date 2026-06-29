import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    SendFollowInput,
    SendFollowResponse,
    ManipulateFollowInput,
    ManipulateFollowResponse,
} from "@/types/mutations/follow_mutations_types"

export const SEND_FOLLOW_MUTATION: TypedDocumentNode<SendFollowResponse, SendFollowInput> = gql`
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

export const MANIPULATE_FOLLOW_MUTATION: TypedDocumentNode<ManipulateFollowResponse, ManipulateFollowInput> = gql`
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
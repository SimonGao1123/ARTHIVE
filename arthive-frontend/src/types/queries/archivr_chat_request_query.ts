import { gql } from "@apollo/client"

export const OBTAIN_ARCHIVR_CONVERSATION = gql`
    query ObtainArchivrConversation($mediaId: ID!, $after: String, $first: Int) {
        obtainArchivrConversation(mediaId: $mediaId, after: $after, first: $first) {
            edges {
                node {
                    id
                    content
                    role
                    createdAt
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`

export type ArchivrMessage = {
    id: string
    content: string
    role: "user" | "assistant"
    createdAt: string
}

export type ObtainArchivrConversationResponse = {
    obtainArchivrConversation: {
        edges: {
            node: ArchivrMessage
        } []
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
        }
    }
}

export type ObtainArchivrConversationInput = {
    mediaId: string
    after: string | null
    first: number
}
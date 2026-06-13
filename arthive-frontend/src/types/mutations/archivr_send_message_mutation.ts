import { gql } from "@apollo/client"
import type { ArchivrMessage } from "../queries/archivr_chat_request_query"

export const MESSAGE_ARCHIVR = gql`
    mutation MessageArchivr($input: MessageArchivrInput!) {
        messageArchivr(input: $input) {
            id
            content
            role
        }
    }
`

export type MessageArchivrInput = {
    input: {
        mediaId: string
        query: string
    }
}

export type MessageArchivrResponse = {
    messageArchivr: ArchivrMessage
}

import type { ArchivrMessage } from "@/types/queries/archivr_queries_types"

export type MessageArchivrInput = {
    input: {
        mediaId: string
        query: string
    }
}

export type MessageArchivrResponse = {
    messageArchivr: ArchivrMessage
}

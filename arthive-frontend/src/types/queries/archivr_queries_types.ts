import type { Review } from "@/types/domain/review"
import type { ListType } from "@/types/queries/list_queries_types"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import type { Media } from "@/types/domain/media"


export type ArchivrMessage = {
    id: string
    content: string
    role: "user" | "assistant"
    createdAt: string
    reviewRefs: Review[]
    listRefs: ListType[]
    threadRefs: CommunityThread[]
    mediaRefs: Media[]
}

export type ObtainArchivrConversationResponse = {
    obtainArchivrConversation: {
        edges: {
            node: ArchivrMessage
        }[]
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

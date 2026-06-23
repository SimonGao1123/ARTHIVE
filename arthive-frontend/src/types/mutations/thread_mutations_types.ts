import type { CommunityThread } from "@/types/queries/thread_queries_types"

export type LikeThreadInput = {
    input: {
        threadId: string
    }
}

export type LikeThreadResponse = {
    likeThread: boolean
}

export type CreateThreadInput = {
    input: {
        communityId: string
        content: string
        title?: string
        parentThreadId?: string
        rootThreadId?: string
        reviewId?: string
    }
}

export type CreateThreadResponse = {
    createThread: CommunityThread
}

export type EditThreadInput = {
    input: {
        threadId: string
        content: string
        title?: string
        reviewId?: string
        deleteThread: boolean
    }
}

export type EditThreadResponse = {
    editThread: CommunityThread
}

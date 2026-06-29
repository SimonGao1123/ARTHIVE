import type { User } from "@/types/domain/user"
import type { Review } from "@/types/domain/review"

export type Community = {
    id: number
    media: {
        id: string
        title: string
        year: number
        creator: string
        coverImage: string
    }
}

export type CommunityThread = {
    id: string
    title: string | null
    content: string
    createdAt: string
    updatedAt: string
    user: User
    likesCount: number
    childThreadsCount: number
    parentThreadId: string | null
    rootThreadId: string | null
    depth: number
    ifLiked: boolean
    community: Community | null
    imageDetails: {
        signedId: string
        url: string
    }[]
    review: Review | null
    hasReview: boolean
}

// ────────────── OBTAIN_COMMUNITY_QUERY ──────────────

export type ObtainCommunityInput = {
    mediaId: string
    first: number
    after: string
    query: string | null
}

export type ObtainCommunityResponse = {
    obtainCommunity: {
        id: number
        media: {
            id: string
            title: string
            year: number
            creator: string
            coverImage: string
        }
        rootThreads: {
            edges: {
                node: CommunityThread
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
    }
}

// ────────────── OBTAIN_THREAD_QUERY ──────────────

export type ObtainThreadInput = {
    threadId: string
    after: string | null
    first: number
}

export type ObtainThreadResponse = {
    obtainThread: {
        id: string
        content: string
        title: string
        createdAt: string
        user: User
        community: Community
        parentThreadId: string | null
        rootThreadId: string | null
        depth: number
        likesCount: number
        ifLiked: boolean
        childThreadsCount: number
        imageDetails: {
            signedId: string
            url: string
        }[]
        hasReview: boolean
        review: Review | null
        childThreads: {
            edges: {
                node: CommunityThread
            }[]
        }
    }
}

// ────────────── OBTAIN_TRENDING_THREADS_QUERY ──────────────

export type ObtainTrendingThreadsInput = {
    limit?: number
    mediaIdScope?: string | null
}

export type ObtainTrendingThreadsResponse = {
    obtainTrendingThreads: CommunityThread[]
}

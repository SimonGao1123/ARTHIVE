// Thread response types. `CommunityThread` is the fat superset — all fields
// that any thread query might return. Nullable fields use `T | null`;
// nothing is `?` optional in a response body.
//
// Some queries don't select every field on this type (e.g. rootThreads inside
// a Community don't re-select community). Those absent fields come back as
// undefined at runtime; consumers should use `??` or `?.` when reading them.

import type { User } from "@/types/domain/user"
import type { Review } from "@/types/domain/review"

export type Community = {
    id: string | number
    media: {
        id: string
        title: string
        year: number | string
        creator: string
        coverImage: string | null
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
    imageDetails: { signedId: string; url: string }[]
    review: Review | null
    hasReview: boolean
}

// ────────────── OBTAIN_COMMUNITY_QUERY ──────────────

export type ObtainCommunityInput = {
    mediaId: string
    first?: number
    after?: string | null
    query?: string | null
}

export type ObtainCommunityResponse = {
    obtainCommunity: {
        id: string | number
        media: {
            id: string
            title: string
            year: number | string
            creator: string
            coverImage: string | null
        }
        rootThreads: {
            edges: { node: CommunityThread }[]
            pageInfo: {
                endCursor: string | null
                hasNextPage: boolean
            }
        }
    }
}

// ────────────── OBTAIN_THREAD_QUERY ──────────────

export type ObtainThreadInput = {
    threadId: string
    after?: string | null
    first?: number
}

export type ObtainThreadResponse = {
    obtainThread: CommunityThread & {
        childThreads: {
            edges: { node: CommunityThread }[]
            pageInfo: {
                endCursor: string | null
                hasNextPage: boolean
            }
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

import type { Media } from "@/types/domain/media"

type ExploreMediaInputBase<T> =
    | { contentType: T; first: number; after?: string | null; last?: never; before?: never }
    | { contentType: T; last: number; before?: string | null; first?: never; after?: never }

type ExploreContentType = "book" | "film" | "series" | "game" | "all"

type ExploreMediaNode = {
    id: number
    coverImage: string
    contentType: string
    ifFavorite: boolean
    ifFinished: boolean
    favoriteCount: number
    averageRating: number
}

export type NewestExplorePageMediaResponse = {
    newestExploreMedia: {
        edges: { node: ExploreMediaNode }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
            hasPreviousPage: boolean
            startCursor: string | null
        }
    }
}

export type NewestExplorePageMediaInput = ExploreMediaInputBase<ExploreContentType>

export type ObtainMediaInfoResponse = {
    obtainMediaInfo: Media
}

export type ObtainMediaInfoInput = {
    mediaId: number
}

export type HottestExplorePageMediaResponse = {
    hottestExploreMedia: {
        edges: { node: ExploreMediaNode }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
            hasPreviousPage: boolean
            startCursor: string | null
        }
    }
}

export type HottestExplorePageMediaInput = ExploreMediaInputBase<ExploreContentType>

export type BecauseOfReviewsExploreMediaResponse = {
    becauseOfReviewsExploreMedia: {
        media: {
            edges: { node: ExploreMediaNode }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
                hasPreviousPage: boolean
                startCursor: string | null
            }
        }
        source: {
            id: number
            title: string
            contentType: string
        }
    } | null
}

export type BecauseOfReviewsExploreMediaInput = ExploreMediaInputBase<ExploreContentType>

export type ObtainFinishedMediaInput = {
    userId: string
    contentType?: "book" | "film" | "series" | "game" | "all"
    pageNum?: number
    limit?: number
    query?: string | null
}

export type ObtainFinishedMediaResponse = {
    obtainFinishedMedia: {
        user: {
            id: string
            username: string
        }
        media: Media[]
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type SearchMediaForListInput = {
    query: string
    listId: string
    first?: number
    after?: string | null
}

export type SearchMediaForListResponse = {
    searchMediaForList: {
        edges: { node: Media }[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
    }
}

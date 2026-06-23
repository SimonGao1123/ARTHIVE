import type { Media } from "@/types/domain/media"

type ExploreMediaInputBase<T> =
    | { contentType: T; first: number; after?: string; last?: never; before?: never }
    | { contentType: T; last: number; before?: string; first?: never; after?: never }

type ExploreContentType = "book" | "film" | "series" | "game" | "all"

export type NewestExplorePageMediaResponse = {
    newestExploreMedia: {
        edges: {
            node: {
                id: number
                coverImage: string
                contentType: string
                ifFavorite: boolean
                ifFinished: boolean
                favoriteCount: number
                averageRating: number
            }
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
            hasPreviousPage: boolean
            startCursor: string
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
        edges: {
            node: {
                id: number
                coverImage: string
                contentType: string
                ifFavorite: boolean
                ifFinished: boolean
            }
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
            hasPreviousPage: boolean
            startCursor: string
        }
    }
}

export type HottestExplorePageMediaInput = ExploreMediaInputBase<ExploreContentType>

export type BecauseOfReviewsExploreMediaResponse = {
    becauseOfReviewsExploreMedia: {
        media: {
            edges: {
                node: Media
            }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string
                hasPreviousPage: boolean
                startCursor: string
            }
        }
        source: {
            id: number
            title: string
            contentType: string
        }
    }
}

export type BecauseOfReviewsExploreMediaInput = ExploreMediaInputBase<ExploreContentType>

export type ObtainFinishedMediaInput = {
    userId: string
    contentType: "book" | "film" | "series" | "game" | "all"
    pageNum: number
    limit: number
    query: string | null
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

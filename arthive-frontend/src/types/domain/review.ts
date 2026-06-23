import type { ImageDetail, UserSummary } from "../common"
import type { ReviewComment } from "./comment"

export type UserReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    imageDetails: ImageDetail[]
}

type ReviewMedia = {
    id: number
    title: string
    coverImage: string
    creator: string
    year: number
    genre: string[]
    contentType: "book" | "film" | "series" | "game"
}

export type Review = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string

    user: UserSummary

    likeCount: number,
    commentCount: number,
    ifLiked: boolean,
    imageDetails: ImageDetail[]
    media?: Partial<ReviewMedia> & { id: number, title: string, coverImage: string }
}

export type AllReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string
    media: ReviewMedia

    imageDetails: ImageDetail[]
    likeCount: number,
    commentCount: number,
    ifLiked: boolean,
}

export type MainReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string

    user: UserSummary
    media: ReviewMedia
    imageDetails: ImageDetail[]
    likeCount: number
    commentCount: number
    ifLiked: boolean
}

export type ReviewPage = {
    review: MainReview
    reviewComments: {
        edges: {
            node: ReviewComment
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
        }
    }
}

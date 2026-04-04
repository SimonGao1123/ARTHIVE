import type { Media } from "./media_type"

export type UserReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
}

export type Review = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string

    user: {
        id: number
        username: string
        profilePicture: string | null
    }
}

export type AllReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string
    media: {
        id: number
        title: string
        coverImage: string
        creator: string
        year: number
        genre: string[]
        contentType: "book" | "film" | "series"
    }
}
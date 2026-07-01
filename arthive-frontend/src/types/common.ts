export type ContentType = "book" | "film" | "series" | "game"
export type ContentTypeWithAll = ContentType | "all"

export type LikesType = "media" | "reviews" | "lists"

export type ImageDetail = {
    signedId: string
    url: string
}

export type UserSummary = {
    id: number | string
    username: string
    profilePicture: string | null
}

export type MediaSummary = {
    id: number | string
    title: string
    coverImage: string | null
    contentType?: ContentType
}

export type MediaCardData = {
    id: number | string
    coverImage: string
    contentType: string
    ifFavorite: boolean
    ifFinished: boolean
    averageRating: number
}

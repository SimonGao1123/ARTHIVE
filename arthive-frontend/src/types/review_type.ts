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

    likeCount: number,
    commentCount: number,
    ifLiked: boolean,
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
        contentType: "book" | "film" | "series" | "game"
    }

    
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

    user: {
        id: number
        username: string
        profilePicture: string | null
    }
    media: {
        id: number
        title: string
        coverImage: string
        creator: string
        year: number
        genre: string[]
        contentType: "book" | "film" | "series" | "game"
    }
    likeCount: number
    commentCount: number
    ifLiked: boolean
}

export type ReviewComment = {
    id: number
    comment: string
    createdAt: string

    user: {
        id: number
        username: string
        profilePicture: string | null
    }
}

export type ReviewPage = {
    review: MainReview
    reviewComments: ReviewComment[]
}
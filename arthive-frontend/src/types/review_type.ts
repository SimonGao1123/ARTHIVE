export type UserReview = {
    id: number
    content?: string
    rating?: number
    ifFavorite: boolean
    ifFinished: boolean
    imageDetails: {
        signedId: string
        url: string
    }[]
}

type ImageDetail = {
    signedId: 
    string
    url: string
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
    imageDetails: ImageDetail[]
    media: {
        id: number
        title: string
        coverImage: string
        creator: string
        year: number
        genre: string[]
        contentType: "book" | "film" | "series" | "game"
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
        contentType: "book" | "film" | "series" | "game"
    }

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
    imageDetails: ImageDetail[]
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
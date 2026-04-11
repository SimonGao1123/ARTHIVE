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
import { gql } from "@apollo/client"

export const OBTAIN_LIKED_OR_FINISHED_MEDIA_QUERY = gql`
    query ObtainLikedOrFinishedMedia($userId: ID!, $type: String!, $contentType: ContentTypeEnum!, $pageNum: Int, $limit: Int, $query: String) {
        obtainLikedOrFinishedMedia(userId: $userId, type: $type, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
            user {
                id
                username
            }
            media {
                id
                title
                creator
                year
                genre
                contentType
                coverImage
                ifFavorite
                ifFinished
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

export type LikedOrFinishedMediaCard = {
    id: string
    title: string
    creator: string
    year: string
    genre: string[]
    contentType: "book" | "film" | "series" | "game"
    coverImage: string | null
    ifFavorite: boolean
    ifFinished: boolean
}

export type ObtainLikedOrFinishedMediaInput = {
    userId: string
    type: "liked" | "finished"
    contentType: "book" | "film" | "series" | "game" | "all"
    pageNum: number
    limit: number
    query: string | null
}

export type ObtainLikedOrFinishedMediaResponse = {
    obtainLikedOrFinishedMedia: {
        user: {
            id: string
            username: string
        }
        media: LikedOrFinishedMediaCard[]
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

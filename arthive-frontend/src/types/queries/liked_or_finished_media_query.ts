import { gql } from "@apollo/client"
import type { Media } from "../media_type"
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
                favoriteCount
                averageRating
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

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
        media: Media[]
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

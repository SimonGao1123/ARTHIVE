import { gql } from "@apollo/client"
import type { Media } from "../media_type"

export const OBTAIN_FINISHED_MEDIA_QUERY = gql`
    query ObtainFinishedMedia($userId: ID!, $contentType: ContentTypeEnum!, $pageNum: Int, $limit: Int, $query: String) {
        obtainFinishedMedia(userId: $userId, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
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

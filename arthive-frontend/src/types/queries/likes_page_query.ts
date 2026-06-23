import { gql } from "@apollo/client"
import type { Media } from "../media_type"
import type { AllUserListType } from "./lists_request_queries"

export type LikesType = "media" | "reviews" | "lists"

export const OBTAIN_LIKES_PAGE_QUERY = gql`
    query ObtainLikesPage($userId: ID!, $type: LikesPageDisplayTypeEnum!, $contentType: ContentTypeEnum!, $pageNum: Int, $limit: Int, $query: String) {
        obtainLikesPage(userId: $userId, type: $type, contentType: $contentType, pageNum: $pageNum, limit: $limit, query: $query) {
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
            reviews {
                id
                content
                rating
                ifFavorite
                ifFinished
                createdAt
                commentCount
                likeCount
                ifLiked
                imageDetails {
                    signedId
                    url
                }
                user {
                    id
                    username
                    profilePicture
                }
                media {
                    id
                    title
                    coverImage
                }
            }
            lists {
                id
                name
                description
                contentType
                ifPrivate
                tags
                createdAt
                updatedAt
                mediaInLists(pageNum: 1, limit: 3) {
                    media {
                        id
                        coverImage
                    }
                }
                ifEditable
                role
            }
            pageInfo {
                totalPages
                totalCount
            }
        }
    }
`

export type ObtainLikesPageInput = {
    userId: string
    type: LikesType
    contentType: "book" | "film" | "series" | "game" | "all"
    pageNum: number
    limit: number
    query: string | null
}

export type LikedReview = {
    id: string
    content: string | null
    rating: number | null
    ifFavorite: boolean
    ifFinished: boolean
    createdAt: string
    commentCount: number
    likeCount: number
    ifLiked: boolean
    imageDetails: { signedId: string, url: string }[]
    user: { id: string, username: string, profilePicture: string | null }
    media: { id: string, title: string, coverImage: string | null }
}

export type ObtainLikesPageResponse = {
    obtainLikesPage: {
        user: { id: string, username: string }
        media: Media[] | null
        reviews: LikedReview[] | null
        lists: AllUserListType[] | null
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

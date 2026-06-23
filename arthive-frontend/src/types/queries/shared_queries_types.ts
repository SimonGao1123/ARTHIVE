import type { Media } from "@/types/domain/media"
import type { User } from "@/types/domain/user"
import type { UserReview } from "@/types/domain/review"
import type { ReviewComment } from "@/types/domain/comment"
import type { LikesType, ContentTypeWithAll } from "@/types/common"
import type { AllUserListType } from "@/types/queries/list_queries_types"
import type { FollowData } from "@/types/queries/follow_queries_types"
import type { CommunityThread } from "@/types/queries/thread_queries_types"

// ────────────── OBTAIN_LIKES_PAGE_QUERY ──────────────

export type { LikesType }

export type ObtainLikesPageInput = {
    userId: string
    type: LikesType
    contentType: ContentTypeWithAll
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

// ────────────── OBTAIN_NOTIFICATIONS_QUERY ──────────────

export type ObtainNotificationFilterEnum =
    | "all" | "follows" | "reviews" | "threads" | "quote_reviews" | "lists" | "list_members"

export type ObtainNotificationsInput = {
    after_read: string | null
    first_read: number
    after_unread: string | null
    first_unread: number
    filter: ObtainNotificationFilterEnum
}

export type Notification = {
    id: string
    sender: User & { followFromCurrentUser: { id: string, status: string } | null }
    action: string
    createdAt: string
    follow: FollowData
    review: UserReview
    reviewComment: ReviewComment
    parentThread: CommunityThread
    commentThread: CommunityThread
    list: { id: string, name: string } | null
    listMember: {
        id: string
        status: "pending" | "accepted" | "rejected"
        role: string
        list: { id: string, name: string }
        sentByUser: { id: string, username: string, profilePicture: string | null } | null
    } | null
}

export type ObtainNotificationsResponse = {
    obtainNotifications: {
        unreadNotificationsCount: number
        readNotificationsCount: number
        unreadNotifications: {
            edges: {
                node: Notification
            }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
        readNotifications: {
            edges: {
                node: Notification
            }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
    }
}

// ────────────── SEARCH_BAR_QUERY ──────────────

export type MediaSearchType = {
    id: string
    title: string
    coverImage: string
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}

export type UserSearchType = {
    id: string
    username: string
    profilePicture: string
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}

export type CommunitySearchType = {
    id: string
    media: MediaSearchType
}

export type ListSearchType = {
    id: string
    name: string
    description: string | null
    contentType: string[]
    ifPrivate: boolean
    tags: string[]
    user: UserSearchType
    mediaInLists: {
        media: MediaSearchType
    }[]
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}

export type ThreadSearchType = {
    id: string
    title: string | null
    content: string
    user: UserSearchType
    community: CommunitySearchType
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}

export type ReviewSearchType = {
    id: string
    content: string
    rating: number
    media: MediaSearchType
    user: UserSearchType
}

export type SearchFilter = {
    filter: "content_type" | "genre"
    values: string[]
}

export type SearchBarInput = {
    query: string
    searchType: string
    searchFilter: SearchFilter[]
    after: string | null
    first: number | null
}

export type SearchBarResponse = {
    searchBar: {
        medias: {
            edges: { node: MediaSearchType }[]
            pageInfo: { endCursor: string, hasNextPage: boolean }
        }
        users: {
            edges: { node: UserSearchType }[]
            pageInfo: { endCursor: string, hasNextPage: boolean }
        }
        reviews: {
            edges: { node: ReviewSearchType }[]
            pageInfo: { endCursor: string, hasNextPage: boolean }
        }
        lists: {
            edges: { node: ListSearchType }[]
            pageInfo: { endCursor: string, hasNextPage: boolean }
        }
        threads: {
            edges: { node: ThreadSearchType }[]
            pageInfo: { endCursor: string, hasNextPage: boolean }
        }
    }
}

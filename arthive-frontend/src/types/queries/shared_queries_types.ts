import type { LikesType, ContentTypeWithAll } from "@/types/common"
import type { AllUserListType } from "@/types/queries/list_queries_types"
import type { Media } from "@/types/domain/media"

// ────────────── OBTAIN_LIKES_PAGE_QUERY ──────────────

export type { LikesType }

type UserSummary = {
    id: string
    username: string
    profilePicture: string | null
}

type ImageDetail = {
    signedId: string
    url: string
}

export type ObtainLikesPageInput = {
    userId: string
    type: LikesType
    contentType: ContentTypeWithAll
    pageNum?: number
    limit?: number
    query?: string
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
    imageDetails: ImageDetail[]
    user: UserSummary
    media: {
        id: string
        title: string
        coverImage: string | null
    }
}

export type ObtainLikesPageResponse = {
    obtainLikesPage: {
        user: {
            id: string
            username: string
        }
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

// Each connection inside the response takes its own cursor pair — variable
// names use snake_case in the .ts document; keep that verbatim so the input
// shape matches what Apollo actually sends.
export type ObtainNotificationsInput = {
    after_read?: string
    first_read?: number
    after_unread?: string
    first_unread?: number
    filter: ObtainNotificationFilterEnum
}

// Fan-out of every possible ref a notification can carry. All refs are
// nullable — only the ones relevant to the notification's `action` are set.
type NotificationSender = UserSummary & {
    followFromCurrentUser: { id: string; status: string } | null
}

export type Notification = {
    id: string
    sender: NotificationSender
    action: string
    createdAt: string
    follow: {
        id: string
        status: string
        receiver?: { id: string }
    } | null
    review: {
        id: string
        content: string | null
        imageDetails: { url: string }[]
    } | null
    reviewComment: {
        id: string
        comment: string
    } | null
    parentThread: {
        id: string
        content: string
        title: string | null
        imageDetails: { url: string }[]
        community: {
            id: string
            media: {
                id: string
                title: string
                coverImage: string | null
            }
        }
    } | null
    commentThread: {
        id: string
        content: string
        imageDetails: { url: string }[]
    } | null
    list: {
        id: string
        name: string
    } | null
    listMember: {
        id: string
        list: {
            id: string
            name: string
        }
        role: string
        status: string
        sentByUser: UserSummary | null
    } | null
}

export type ObtainNotificationsResponse = {
    obtainNotifications: {
        unreadNotificationsCount: number
        readNotificationsCount: number
        unreadNotifications: {
            edges: { node: Notification }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
        readNotifications: {
            edges: { node: Notification }[]
            pageInfo: {
                hasNextPage: boolean
                endCursor: string | null
            }
        }
    }
}

// ────────────── SEARCH_BAR_QUERY ──────────────

// The search bar issues one big query with a separate cursor pair per
// result type. All are optional because the caller usually only sends the
// cursors for the tab currently in view.
export type SearchFilter = {
    filter: "content_type" | "genre"
    values: string[]
}

export type SearchBarInput = {
    query: string
    searchType: string
    searchFilter: SearchFilter[]
    after_medias?: string
    first_medias?: number
    after_users?: string
    first_users?: number
    after_reviews?: string
    first_reviews?: number
    after_lists?: string
    first_lists?: number
    after_threads?: string
    first_threads?: number
}

// Node shapes for each result type — matched exactly against SEARCH_BAR_QUERY.
// pageInfo lives ONLY on the connection wrappers, never on individual nodes.
export type MediaSearchType = {
    id: string
    title: string
    coverImage: string | null
}

export type UserSearchType = {
    id: string
    username: string
    profilePicture: string | null
}

export type ReviewSearchType = {
    id: string
    content: string | null
    rating: number | null
    media: MediaSearchType
    user: UserSearchType
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
        media: { coverImage: string | null }
    }[]
}

export type ThreadSearchType = {
    id: string
    title: string | null
    content: string
    user: UserSearchType
    community: {
        id: string
        media: MediaSearchType
    }
}

// Kept for API compatibility if any component imported it.
export type CommunitySearchType = {
    id: string
    media: MediaSearchType
}

type Connection<T> = {
    edges: { node: T }[]
    pageInfo: {
        endCursor: string | null
        hasNextPage: boolean
    }
}

export type SearchBarResponse = {
    searchBar: {
        medias: Connection<MediaSearchType>
        users: Connection<UserSearchType>
        reviews: Connection<ReviewSearchType>
        lists: Connection<ListSearchType>
        threads: Connection<ThreadSearchType>
    }
}

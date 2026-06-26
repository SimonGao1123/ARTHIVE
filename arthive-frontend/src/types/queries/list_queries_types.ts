import type { User } from "@/types/domain/user"
import type { Media } from "@/types/domain/media"

export type RoleFilter = "owner" | "admin" | "member" | "saved" | null

export type AllUserListType = {
    id: string
    name: string
    description: string | null
    contentType: string[]
    ifPrivate: boolean
    tags: string[]
    createdAt: string
    updatedAt: string

    mediaInLists: {
        media: {
            id: string
            coverImage: string | null
        }
    }[]
    ifEditable: boolean | null
    role: string | null
    ifSaved: boolean
    savedCount: number
}

export type ObtainAllUserListsInput = {
    userId: string
    pageNum: number
    limit: number
    contentType: "book" | "film" | "series" | "game" | "all"
    query: string | null
    excludeMediaId: string | null
    roleFilter: RoleFilter
}

export type ObtainAllUserListsResponse = {
    obtainAllUserLists: {
        user: User
        lists: AllUserListType[]
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type ListMemberSummary = {
    id: string
    status: "pending" | "accepted" | "rejected"
    role: "member" | "admin"
    joinedAt: string | null
    user: { id: string, username: string, profilePicture: string | null }
}

export type ObtainListPageInput = {
    listId: string
    pageNum: number
    limit: number
    query: string | null
}

export type ObtainListPageResponse = {
    obtainListPage: {
        list: {
            id: string
            name: string
            description: string | null
            contentType: string[]
            ifPrivate: boolean
            tags: string[]
            createdAt: string
            updatedAt: string
            likeCount: number
            ifLiked: boolean
            savedCount: number
            ifSaved: boolean
            ifEditable: boolean | null
            role: string | null
            publicListMembers: ListMemberSummary[] | null
            allListMembers: ListMemberSummary[] | null
        }
        mediaInLists: {
            media: Media
        }[]
        user: User
        pageInfo: {
            totalPages: number
            totalCount: number
        }
    }
}

export type ListType = {
    id: string
    name: string
    description: string | null
    contentType: string[]
    ifPrivate: boolean
    tags: string[]
    createdAt: string
    updatedAt: string
    likeCount: number
    ifLiked: boolean
    savedCount: number
    ifSaved: boolean
    user: User
    mediaInLists: {
        media: Media
    }[]
    ifEditable: boolean | null
    role: string | null
    publicListMembers?: ListMemberSummary[] | null
    allListMembers?: ListMemberSummary[] | null
}

export type ObtainTrendingListsInput = {
    contentType: "book" | "film" | "series" | "game" | "all"
    first: number
    after: string | null
    last: number | null
    before: string | null
}

export type ObtainTrendingListsResponse = {
    obtainTrendingLists: {
        edges: {
            node: ListType
        }[]
        pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
            hasPreviousPage: boolean
            startCursor: string | null
        }
    }
}

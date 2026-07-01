// Thread mutation types. CreateThread and EditThread select strict subsets
// of the full CommunityThread — inline the exact shapes here rather than
// reusing CommunityThread (which allows more fields than these mutations
// actually return).

type UserSummary = {
    id: string
    username: string
    profilePicture: string | null
}

type ThreadReviewSummary = {
    id: string
    content: string | null
    rating: number | null
    ifFavorite: boolean
    ifFinished: boolean
    updatedAt: string
    user: UserSummary
    media: {
        id: string
        title: string
        coverImage: string | null
    }
}

export type LikeThreadInput = {
    input: {
        threadId: string
    }
}

export type LikeThreadResponse = {
    likeThread: boolean
}

export type CreateThreadInput = {
    input: {
        communityId: string
        content: string
        title?: string
        parentThreadId?: string
        rootThreadId?: string
        reviewId?: string
    }
}

export type CreateThreadResponse = {
    createThread: {
        id: string
        title: string | null
        content: string
        createdAt: string
        user: UserSummary
        likesCount: number
        childThreadsCount: number
        ifLiked: boolean
        parentThreadId: string | null
        rootThreadId: string | null
        depth: number
        review: ThreadReviewSummary | null
    }
}

export type EditThreadInput = {
    input: {
        threadId: string
        content: string
        title?: string
        reviewId?: string
        deleteThread: boolean
    }
}

// EditThread selects everything CreateThread does PLUS a `community.media`
// summary at the end.
export type EditThreadResponse = {
    editThread: {
        id: string
        title: string | null
        content: string
        createdAt: string
        user: UserSummary
        likesCount: number
        childThreadsCount: number
        ifLiked: boolean
        parentThreadId: string | null
        rootThreadId: string | null
        depth: number
        review: ThreadReviewSummary | null
        community: {
            media: {
                id: string
                title: string
                coverImage: string | null
            }
        }
    }
}

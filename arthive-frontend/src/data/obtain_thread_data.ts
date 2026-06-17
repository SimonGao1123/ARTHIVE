import type { Dispatch, SetStateAction } from "react";
import type { CommunityThread } from "../types/queries/community_request_queries";
import type { User } from "../types/user_types";
import type { NavigateFunction } from "react-router-dom";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainThreadData(
    threadId: string,
    cursor: string | null,
    setCursor: Dispatch<SetStateAction<string | null>>,
    limit: number,
    obtainThread: any,
    setMainThread: (mainThread: CommunityThread | null) => void,
    setChildThreads: Dispatch<SetStateAction<CommunityThread[]>>,
    setIfNextPage: (ifNextPage: boolean) => void,
    setUser: (user: User | null) => void,
    navigate: NavigateFunction,
) {
    obtainThread({
        variables: {
            threadId: threadId,
            after: cursor,
            first: limit
        }
    })
    .then((data: any) => {
        const batch = data.data.obtainThread
        setMainThread({
            id: batch.id,
            content: batch.content,
            createdAt: batch.createdAt,
            user: batch.user,
            community: batch.community,
            parentThreadId: batch.parentThreadId,
            rootThreadId: batch.rootThreadId,
            likesCount: batch.likesCount,
            ifLiked: batch.ifLiked,
            childThreadsCount: batch.childThreadsCount,
            title: batch.title,
            updatedAt: batch.updatedAt,
            imageDetails: batch.imageDetails,
            review: batch.review,
            hasReview: batch.hasReview,
        })
        setChildThreads((prev) => {
            const existingIds = new Set(prev.map((t) => t.id))
            return [...prev, ...batch.childThreads.edges.map((edge: any) => edge.node).filter((t: any) => !existingIds.has(t.id))]
        })
        setIfNextPage(batch.childThreads.pageInfo.hasNextPage)
        setCursor(batch.childThreads.pageInfo.endCursor)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
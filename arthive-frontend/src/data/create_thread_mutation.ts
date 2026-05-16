import type { Dispatch, SetStateAction } from "react";
import type { CommunityThread } from "../types/queries/community_request_queries";
import type { User } from "../types/user_types";
import { logout } from "./logout";
import type { NavigateFunction } from "react-router-dom";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function createThreadMutation(
    createThread: any,
    communityId: string,
    content: string,
    title: string | null,
    parentThreadId: string | null,
    rootThreadId: string | null,
    setUser: (user: User | null) => void,
    navigate: NavigateFunction,
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>
) {
    createThread({
        variables: {
            input: {
                communityId: communityId,
                content: content,
                title: title,
                parentThreadId: parentThreadId,
                rootThreadId: rootThreadId
            }
        }
    }).then((data: any) => {
        setThreads(prev => {
            const existingIds = new Set(prev.map(thread => thread.id))
            return [data.data.createThread, ...prev.filter((thread: any) => !existingIds.has(thread.id))]
        })
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
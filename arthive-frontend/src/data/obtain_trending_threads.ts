import type { CommunityThread } from "../types/queries/community_request_queries"
import type { Dispatch, SetStateAction } from "react"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainTrendingThreadsFunction(
    obtainTrendingThreads: any,
    limit: number,
    mediaIdScope: string | null,
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>,
    navigate: any,
    setUser: any
) {
    obtainTrendingThreads({ variables: { limit, mediaIdScope } })
        .then((data: any) => {
            setThreads(data.data.obtainTrendingThreads)
        })
        .catch((error: any) => {
            if (unauth_messages.includes(error.message)) {
                logout(setUser, navigate)
            }
        })
}

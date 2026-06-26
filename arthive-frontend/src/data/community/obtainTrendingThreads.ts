import type { CommunityThread } from "@/types/queries/thread_queries_types"
import type { Dispatch, SetStateAction } from "react"
import { handleReadUnauth } from "@/data/auth/handleReadUnauth"

export function obtainTrendingThreadsFunction(
    obtainTrendingThreads: any,
    limit: number,
    mediaIdScope: string | null,
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>,
    _navigate: any,
    setUser: any
) {
    obtainTrendingThreads({ variables: { limit, mediaIdScope } })
        .then((data: any) => {
            setThreads(data.data.obtainTrendingThreads)
        })
        .catch((error: any) => {
            handleReadUnauth(error, setUser)
        })
}

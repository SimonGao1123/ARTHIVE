import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { CommunityThreadPaginated } from "@/features/community/components/CommunityThread"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import { OBTAIN_TRENDING_THREADS_QUERY } from "@/apollo/queries/thread_queries"
import type { ObtainTrendingThreadsInput, ObtainTrendingThreadsResponse } from "@/types/queries/thread_queries_types"
import { obtainTrendingThreadsFunction } from "@/data/community/obtainTrendingThreads"
import type { User } from "@/types/domain/user"
import type { NavigateFunction } from "react-router-dom"


const LIMIT = 5
type TrendingThreadsSectionProps = {
    mediaIdScope?: string | null
    setUser: (user: User | null) => void
    navigate: NavigateFunction
    user: User | null
}

export function TrendingThreadsSection({ mediaIdScope, setUser, navigate, user }: TrendingThreadsSectionProps) {
    const [threads, setThreads] = useState<CommunityThread[]>([])
    const [getTrendingThreads, {loading, error}] = useLazyQuery<ObtainTrendingThreadsResponse, ObtainTrendingThreadsInput>(OBTAIN_TRENDING_THREADS_QUERY)

    useEffect(() => {
        obtainTrendingThreadsFunction(getTrendingThreads, LIMIT, mediaIdScope ?? null, setThreads, navigate, setUser)
    }, [mediaIdScope])

    return (
        <div className="flex flex-col gap-3">
            {loading ? <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div> : error ? <div className="text-red-500">{error.message}</div> : <></>}
            {threads.map((thread) => (
                <CommunityThreadPaginated
                    key={thread.id}
                    thread={thread}
                    setUser={setUser}
                    navigate={navigate}
                    media_id={thread.community?.media.id ?? ""}
                    user={user}
                />
            ))}
        </div>
    )
}

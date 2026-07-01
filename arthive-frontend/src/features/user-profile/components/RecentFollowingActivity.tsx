import { useDataQuery } from "@/apollo/useDataQuery"
import type { Activity, ActivityFilterEnum, RecentFollowingActivityInput, RecentFollowingActivityResponse } from "@/types/queries/user_queries_types"
import { useEffect, useState } from "react"
import { RECENT_FOLLOWING_ACTIVITY_REQUEST } from "@/apollo/queries/user_queries"
import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import { ActivityCard } from "@/features/user-profile/components/RecentUserActivity"

type RecentFollowingActivityProps = {
    setUser: (user: User | null) => void
    navigate: any
    filter: ActivityFilterEnum
}

const LIMIT = 10

export default function RecentFollowingActivity({setUser, navigate, filter}: RecentFollowingActivityProps) {

    const [page, setPage] = useState<{cursor: string | null, filter: ActivityFilterEnum}>({cursor: null, filter: "all"})

    const [recentFollowingActivity, setRecentFollowingActivity] = useState<Activity[]>([])
    const { data, error, loading } = useDataQuery<RecentFollowingActivityResponse, RecentFollowingActivityInput>(RECENT_FOLLOWING_ACTIVITY_REQUEST, {
        fetchPolicy: "no-cache",
        variables: {
            filter: page.filter,
            after: page.cursor,
            first: LIMIT,
        }
    })

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])

    const hasNextPage = data?.recentFollowingActivity.pageInfo.hasNextPage ?? false
    const cursor = data?.recentFollowingActivity.pageInfo.endCursor ?? null

    // Dedup on append. In React StrictMode this effect runs twice with the
    // same `data` reference on the first render, so dedup by (id, __typename)
    // makes the second call a no-op and guards against page overlap.
    useEffect(() => {
        if (!data) return
        const incoming = data.recentFollowingActivity.edges.map((edge) => edge.node)
        setRecentFollowingActivity((prev) => {
            const seen = new Set(prev.map((a) => `${a.id}-${a.subject?.__typename}`))
            return [...prev, ...incoming.filter((a) => !seen.has(`${a.id}-${a.subject?.__typename}`))]
        })
    }, [data])

    // Reset the feed and refetch when the filter changes.
    useEffect(() => {
        setRecentFollowingActivity([])
        setPage({cursor: null, filter: filter})
    }, [filter])

    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setPage({cursor: cursor, filter: page.filter}),
    })

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-[#171519] rounded-2xl border border-white/5 overflow-hidden">
            {loading && (
                <div className="flex flex-col divide-y divide-white/5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-4 items-start animate-pulse">
                            <div className="w-9 h-13 rounded bg-white/10 flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-2 pt-0.5">
                                <div className="h-3 bg-white/10 rounded w-1/3" />
                                <div className="h-3 bg-white/5 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm p-4">{error.message}</p>}
            {!loading && recentFollowingActivity.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No recent activity from people you follow.</p>
            )}
            <div className="flex flex-col divide-y divide-white/5">
                {recentFollowingActivity.map((activity) => (
                    <ActivityCard key={`${activity.id}-${activity.subject?.__typename}`} activity={activity} actor={activity.user} />
                ))}
            </div>
            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    )
}

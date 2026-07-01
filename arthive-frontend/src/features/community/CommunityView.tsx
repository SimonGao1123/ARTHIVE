import { useDataQuery } from "@/apollo/useDataQuery"
import type { ObtainCommunityInput, ObtainCommunityResponse } from "@/types/queries/thread_queries_types"
import { OBTAIN_COMMUNITY_QUERY } from "@/apollo/queries/thread_queries"
import type { User } from "@/types/domain/user"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { CommunityThreads } from "@/features/community/components/CommunityThread"
import { AddThreadComponent } from "@/features/community/components/AddThreadComponent"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import SignInPrompt from "@/shared/components/SignInPrompt"
import type { Community } from "@/types/queries/thread_queries_types"
const LIMIT = 10
export default function CommunityPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
    const navigate = useNavigate()
    const { media_id } = useParams()
    if (!media_id) {
        navigate("/")
    }
    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string | null>(null)

    const { data, loading, error, fetchMore } = useDataQuery<ObtainCommunityResponse, ObtainCommunityInput>(
        OBTAIN_COMMUNITY_QUERY,
        {
            variables: { mediaId: media_id ?? "", first: LIMIT, after: null, query: query ?? null },
            skip: !media_id,
            notifyOnNetworkStatusChange: true,
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])

    const obtainCommunity = data?.obtainCommunity
    const community = obtainCommunity ? { id: obtainCommunity.id, media: obtainCommunity.media } : null
    const fetchedThreads = obtainCommunity?.rootThreads.edges.map((e) => e.node) ?? []
    const ifNextPage = obtainCommunity?.rootThreads.pageInfo.hasNextPage ?? false
    const endCursor = obtainCommunity?.rootThreads.pageInfo.endCursor ?? null

    // Optimistic overlay for threads added via AddThreadComponent (it calls
    // setThreads([new, ...prev]) to splice new threads to the top).
    const [optimisticThreads, setOptimisticThreads] = useState<CommunityThread[]>([])
    const setRootThreads = (updater: React.SetStateAction<CommunityThread[]>) => {
        setOptimisticThreads((prev) => {
            const fullPrev = [...prev, ...fetchedThreads]
            const next = typeof updater === "function" ? (updater as (p: CommunityThread[]) => CommunityThread[])(fullPrev) : updater
            const fetchedIds = new Set(fetchedThreads.map((t) => t.id))
            return next.filter((t) => !fetchedIds.has(t.id))
        })
    }
    const rootThreads: CommunityThread[] = [...optimisticThreads, ...fetchedThreads]

    const sentinelRef = useInfiniteScroll({
        hasNextPage: ifNextPage && !!user,
        loading,
        onLoadMore: () => fetchMore({ variables: { after: endCursor ?? undefined } }),
    })

    const threadsTopRef = useRef<HTMLDivElement | null>(null)
    const scrollThreadsToTop = () => threadsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {error && <p className="text-red-400 text-sm">{error.message}</p>}
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}

            {community && <CommunityDetails community={community} />}

            <AddThreadComponent user={user} media_id={media_id ?? ""} setUser={setUser} parentThreadId={null} rootThreadId={null} setThreads={setRootThreads} onCreated={scrollThreadsToTop} replyingToUsername={null} />

            <div ref={threadsTopRef} className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
                        <input
                            type="text"
                            placeholder="Search threads"
                            value={currQuery || ""}
                            onChange={(e) => setCurrQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery || null) }}
                            className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setQuery(currQuery || null)}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 rounded-full px-5 py-2 text-sm transition"
                    >
                        Search
                    </button>
                </div>

                <CommunityThreads threads={rootThreads} sentinelRef={sentinelRef} ifNextPage={ifNextPage && !!user} setUser={setUser} navigate={navigate} media_id={media_id ?? ""} user={user} />
                {ifNextPage && !user && (
                    <SignInPrompt title="Sign in to see more threads" message="Sign in to keep scrolling through community threads." />
                )}
            </div>
        </div>
    )
}

export function CommunityDetails({community}: {community: Community}) {
    const navigate = useNavigate()
    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex gap-4 items-start">
            <img
                onClick={() => navigate(`/media/${community.media.id}`)}
                src={community.media.coverImage ?? undefined}
                alt={community.media.title}
                className="w-20 h-auto rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
            />
            <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Community</p>
                <h1 className="text-xl font-bold text-white truncate">{community.media.title}</h1>
                {community.media.creator && <p className="text-sm text-gray-400">By {community.media.creator}</p>}
                {community.media.year && <p className="text-sm text-gray-400">{community.media.year}</p>}
            </div>
        </div>
    )
}

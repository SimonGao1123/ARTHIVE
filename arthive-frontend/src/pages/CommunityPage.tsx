import { useLazyQuery } from "@apollo/client/react"
import type { Community, ObtainCommunityInput, ObtainCommunityResponse } from "../types/queries/community_request_queries"
import { OBTAIN_COMMUNITY_QUERY } from "../types/queries/community_request_queries"
import type { User } from "../types/user_types"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import type { CommunityThread } from "../types/queries/community_request_queries"
import { obtainCommunityData } from "../data/obtain_community_data"
import { CommunityThreads } from "../lib/CommunityThread"
import { AddThreadComponent } from "../lib/AddThreadComponent"

const LIMIT = 1
export default function CommunityPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
    const navigate = useNavigate()
    const { media_id } = useParams()
    if (!media_id) {
        navigate("/")
    }
    const [obtainCommunity, {loading, error}] = useLazyQuery<ObtainCommunityResponse, ObtainCommunityInput>(OBTAIN_COMMUNITY_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [community, setCommunity] = useState<Community | null>(null)
    const [rootThreads, setRootThreads] = useState<CommunityThread[]>([])

    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string | null>(null)
    const [loadCount, setLoadCount] = useState(0)
    const [ifNextPage, setIfNextPage] = useState(true)

    useEffect(() => {
        obtainCommunityData(media_id!, LIMIT, cursor, query, setCommunity, setRootThreads, setCursor, obtainCommunity, navigate, setUser, setIfNextPage)
    }, [loadCount])

    useEffect(() => {
        if (query) {
            setCursor(null)
            setRootThreads([])
            setLoadCount(prev => prev + 1)
        }
    }, [query])

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {error && <p className="text-red-400 text-sm">{error.message}</p>}
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}

            {community && <CommunityDetails community={community} />}

            <AddThreadComponent media_id={media_id ?? ""} setUser={setUser} parentThreadId={null} rootThreadId={null} setThreads={setRootThreads} />

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
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

                <CommunityThreads threads={rootThreads} setLoadCount={setLoadCount} ifNextPage={ifNextPage} setUser={setUser} navigate={navigate} media_id={media_id ?? ""} user={user} />
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
                src={community.media.coverImage}
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

import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useNavigate } from "react-router-dom"
import type { User } from "@/types/domain/user"
import type { Media } from "@/types/domain/media"
import type {
    SearchMediaForListInput,
    SearchMediaForListResponse,
} from "@/types/queries/media_queries_types"
import { SEARCH_MEDIA_FOR_LIST_QUERY } from "@/apollo/queries/media_queries"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import { addOrRemoveMediaData } from "@/data/media/addOrRemoveMediaData"
import { DetailedMediaCard } from "@/features/media/components/DetailedMediaCard"

const LIMIT = 12

type Props = {
    listId: string
    setUser: (user: User | null) => void
    addOrRemoveMediaInListMutation: any
    onAdded: () => void
}

export default function SearchMediaForList({listId, setUser, addOrRemoveMediaInListMutation, onAdded}: Props) {
    const navigate = useNavigate()

    const [currQuery, setCurrQuery] = useState("")
    const [query, setQuery] = useState("")
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [results, setResults] = useState<Media[]>([])
    const [addedMediaIds, setAddedMediaIds] = useState<string[]>([])
    const [loadMore, setLoadMore] = useState(0)

    const [searchMediaForList, {loading, error}] = useLazyQuery<SearchMediaForListResponse, SearchMediaForListInput>(SEARCH_MEDIA_FOR_LIST_QUERY)

    useEffect(() => {
        if (query.length === 0) return
        searchMediaForList({
            variables: {query, listId, first: LIMIT, after: cursor},
        }).then((data) => {
            const conn = data.data?.searchMediaForList
            if (!conn) return
            const batch = conn.edges.map((e) => e.node)
            setResults((prev) => {
                const seen = new Set(prev.map((m) => m.id))
                return [...prev, ...batch.filter((m) => !seen.has(m.id))]
            })
            setCursor(conn.pageInfo.endCursor)
            setHasNextPage(conn.pageInfo.hasNextPage)
        })
    }, [loadMore])

    function commitQuery() {
        if (currQuery === query) return
        setQuery(currQuery)
        setCursor(null)
        setResults([])
        setHasNextPage(false)
        setLoadMore((n) => n + 1)
    }

    function clearSearch() {
        setCurrQuery("")
        setQuery("")
        setCursor(null)
        setResults([])
        setHasNextPage(false)
    }

    function toggleMedia(mediaId: string, ifAdd: boolean) {
        if (ifAdd && addedMediaIds.includes(mediaId)) return
        if (!ifAdd && !addedMediaIds.includes(mediaId)) return

        addOrRemoveMediaData(addOrRemoveMediaInListMutation, listId, [mediaId], setUser, navigate, ifAdd, onAdded)

        setAddedMediaIds((prev) => ifAdd ? [...prev, mediaId] : prev.filter((id) => id !== mediaId))
    }

    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setLoadMore((n) => n + 1),
    })

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Add Media</label>
            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-1.5 text-xs">
                        {error.message}
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search media to add…"
                        value={currQuery}
                        onChange={(e) => setCurrQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitQuery() }}
                        className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                        type="button"
                        disabled={currQuery === query || currQuery.length === 0}
                        onClick={commitQuery}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                    >
                        Search
                    </button>
                    {(currQuery || query) && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white rounded-full px-4 py-2 text-sm transition"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {loading && results.length === 0 && (
                    <p className="text-gray-500 text-xs">Searching…</p>
                )}
                {query.length > 0 && !loading && results.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No media found.</p>
                )}

                {results.length > 0 && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" }}>
                        {results.map((media) => {
                            const isAdded = addedMediaIds.includes(String(media.id))
                            return (
                                <div key={media.id} className="flex flex-col gap-2">
                                    <DetailedMediaCard media={media} />
                                    {isAdded ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                                                Added
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleMedia(String(media.id), false)}
                                                className="ml-auto bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25 px-2 py-0.5 rounded-full text-xs transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => toggleMedia(String(media.id), true)}
                                            className="bg-violet-500 hover:bg-violet-400 text-white px-3 py-1 rounded-full text-xs transition"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    )
}

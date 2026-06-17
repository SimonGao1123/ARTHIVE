import { useLazyQuery } from "@apollo/client/react"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import type { SearchBarInput, SearchBarResponse } from "../types/queries/search_bar_queries"
import { SEARCH_BAR_QUERY } from "../types/queries/search_bar_queries"
import { quickSearchQuery } from "../data/quick_search_query"
import type { User } from "../types/user_types"

type QuickSearchProps = {
    setSearchResults: Dispatch<SetStateAction<any[]>>
    searchType: string
    limit: number
    setHasNextPage: (hasNextPage: boolean) => void
    loadMore: number
    setUser: (user: User) => void
    setLoadMore: (loadMore: number) => void
    setLoading?: (loading: boolean) => void
}
// For small quick searches (e.g. when adding media to list or choosing which list to add to), no filters
export default function QuickSearch({setSearchResults, searchType, limit, setHasNextPage, loadMore, setUser, setLoadMore, setLoading}: QuickSearchProps) {
    if (searchType != "media" && searchType != "user" && searchType != "review") {
        throw new Error("Invalid search type")
    }
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [currQuery, setCurrQuery] = useState("")
    const [cursor, setCursor] = useState<string | null>(null)

    useEffect(() => {
        if (query.length > 0) {
            quickSearchQuery(query, searchType, cursor, limit, setUser, setHasNextPage, setCursor, setSearchResults, navigate, obtainQuickSearch)
        }
    }, [loadMore])

    useEffect(() => {
        setCursor(null)
        setSearchResults([])
        setLoadMore(loadMore + 1)
    }, [query])

    const [obtainQuickSearch, {loading, error}] = useLazyQuery<SearchBarResponse, SearchBarInput>(SEARCH_BAR_QUERY)

    useEffect(() => {
        if (setLoading) setLoading(loading)
    }, [loading])

    return (
        <div className="flex flex-col gap-2">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-1.5 text-xs">
                    {error.message}
                </div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search media…"
                    value={currQuery}
                    onChange={(e) => setCurrQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery) }}
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
                <button
                    disabled={query === currQuery}
                    onClick={() => setQuery(currQuery)}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-4 py-2 text-sm transition"
                >
                    Search
                </button>
                {(currQuery || query) && (
                    <button
                        onClick={() => {
                            setCurrQuery("")
                            setQuery("")
                            setHasNextPage(false)
                        }}
                        className="border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white rounded-full px-4 py-2 text-sm transition"
                    >
                        Clear
                    </button>
                )}
            </div>
            {loading && <p className="text-gray-500 text-xs">Searching…</p>}
        </div>
    )
}

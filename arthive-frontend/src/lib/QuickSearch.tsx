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
}
// For small quick searches (e.g. when adding media to list or choosing which list to add to), no filters
export default function QuickSearch({setSearchResults, searchType, limit, setHasNextPage, loadMore, setUser}: QuickSearchProps) {
    if (searchType != "media" && searchType != "user" && searchType != "review") {
        throw new Error("Invalid search type")
    }
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [cursor, setCursor] = useState<string | null>(null)

    useEffect(() => {
        if (query.length > 0) {
            setCursor(null)
            setSearchResults([])
            quickSearchQuery(query, searchType, cursor, limit, setUser, setHasNextPage, setCursor, setSearchResults, navigate, obtainQuickSearch)
            
        }
    }, [query, loadMore])
    const [obtainQuickSearch, {loading, error}] = useLazyQuery<SearchBarResponse, SearchBarInput>(SEARCH_BAR_QUERY)
    return (
        <div>
            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}
            <input type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={() => {
                setCursor(null)
                setSearchResults([])
                quickSearchQuery(query, searchType, cursor, limit, setUser, setHasNextPage, setCursor, setSearchResults, navigate, obtainQuickSearch)
            }}>Search</button>
        </div>
    )
}
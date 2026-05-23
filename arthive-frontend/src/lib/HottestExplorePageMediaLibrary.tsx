import { useNavigate } from "react-router-dom"
import type { User } from "../types/user_types.ts"
import { HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, type HottestExplorePageMediaInput, type HottestExplorePageMediaResponse } from "../types/queries/media_request_query"
import { useLazyQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { hottestExplorePageData } from "../data/hottest_explore_page_data"
import { MediaCard } from "./MediaCard.tsx"

export default function HottestExplorePageMediaLibrary({user, setUser, currContentType, limit}: {user: User, setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all", limit: number}) {
    const navigate = useNavigate()
    const [getHottestExplorePageMedia, {loading}] = useLazyQuery<HottestExplorePageMediaResponse, HottestExplorePageMediaInput>(HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string}[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [prevCursor, setPrevCursor] = useState<string | null>(null)
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(false)
    const [ifNextPage, setIfNextPage] = useState<boolean>(false)

    function fetchPage(goNext: boolean, cursor: string | null) {
        hottestExplorePageData(navigate, setUser, currContentType, limit, setNextCursor, setPrevCursor, cursor, goNext, setIfPrevPage, setIfNextPage, setAllMedia, getHottestExplorePageMedia)
    }

    useEffect(() => { fetchPage(true, null) }, [currContentType])

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => fetchPage(false, prevCursor)}
                disabled={!ifPrevPage}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white transition text-lg"
            >
                ‹
            </button>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 flex-1">
                {loading
                    ? Array.from({length: limit}).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-32 h-48 bg-white/5 rounded-xl animate-pulse" />
                    ))
                    : allMedia.map((media) => <MediaCard key={media.id} media={media} />)
                }
            </div>
            <button
                onClick={() => fetchPage(true, nextCursor)}
                disabled={!ifNextPage}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white transition text-lg"
            >
                ›
            </button>
        </div>
    )
}

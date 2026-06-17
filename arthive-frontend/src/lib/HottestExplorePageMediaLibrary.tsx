import { useNavigate } from "react-router-dom"
import type { User } from "../types/user_types.ts"
import { HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, type HottestExplorePageMediaInput, type HottestExplorePageMediaResponse } from "../types/queries/media_request_query"
import { useLazyQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { hottestExplorePageData } from "../data/hottest_explore_page_data"
import { MediaCard } from "./MediaCard.tsx"

export default function HottestExplorePageMediaLibrary({user: _user, setUser, currContentType, limit}: {user: User, setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all", limit: number}) {
    const navigate = useNavigate()
    const [getHottestExplorePageMedia, {loading}] = useLazyQuery<HottestExplorePageMediaResponse, HottestExplorePageMediaInput>(HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string, contentType: string, ifFavorite: boolean, ifFinished: boolean}[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [prevCursor, setPrevCursor] = useState<string | null>(null)
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(false)
    const [ifNextPage, setIfNextPage] = useState<boolean>(false)
    const [slideDir, setSlideDir] = useState<"next" | "prev">("next")
    const [pageKey, setPageKey] = useState(0)

    function fetchPage(goNext: boolean, cursor: string | null) {
        hottestExplorePageData(navigate, setUser, currContentType, limit, setNextCursor, setPrevCursor, cursor, goNext, setIfPrevPage, setIfNextPage, setAllMedia, getHottestExplorePageMedia)
    }

    const handleNav = (goNext: boolean, cursor: string | null) => {
        setSlideDir(goNext ? "next" : "prev")
        setPageKey(k => k + 1)
        fetchPage(goNext, cursor)
    }

    useEffect(() => { fetchPage(true, null) }, [currContentType])

    return (
        <div className="relative group/carousel">
            <div className="overflow-x-hidden overflow-y-visible py-1 px-1">
                <div
                    key={pageKey}
                    className={slideDir === "next" ? "slide-from-right" : "slide-from-left"}
                    style={{ display: "grid", gridTemplateColumns: `repeat(${limit}, 1fr)`, gap: "0.75rem" }}
                >
                    {loading
                        ? Array.from({length: limit}).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))
                        : allMedia.map((media) => <MediaCard key={media.id} media={media} />)
                    }
                </div>
            </div>
            <button
                onClick={() => handleNav(false, prevCursor)}
                disabled={!ifPrevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl transition opacity-0 group-hover/carousel:opacity-100 disabled:hidden shadow-lg"
            >
                ‹
            </button>
            <button
                onClick={() => handleNav(true, nextCursor)}
                disabled={!ifNextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl transition opacity-0 group-hover/carousel:opacity-100 disabled:hidden shadow-lg"
            >
                ›
            </button>
        </div>
    )
}

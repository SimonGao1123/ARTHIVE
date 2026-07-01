import { useEffect, useState } from "react"
import { useDataQuery } from "@/apollo/useDataQuery"
import { NEWEST_EXPLORE_PAGE_MEDIA_QUERY } from "@/apollo/queries/media_queries"
import type { NewestExplorePageMediaResponse, NewestExplorePageMediaInput } from "@/types/queries/media_queries_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import { useNavigate } from "react-router-dom"
import { MediaCard } from "@/features/media/components/MediaCard"

export default function NewestMediaLibrary({setUser, currContentType, limit}: {setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all", limit: number}) {
    const navigate = useNavigate()
    const [page, setPage] = useState<{ 
        direction: "next" | "prev",
        cursor: string | null,
        contentType: typeof currContentType}>({ direction: "next", cursor: null, contentType: currContentType })
    const [slideDir, setSlideDir] = useState<"next" | "prev">("next")
    const [pageKey, setPageKey] = useState(0)

    if (currContentType !== page.contentType) { // changed content type
        setPage({ direction: "next", cursor: null, contentType: currContentType })
    }

    const { data, loading, error } = useDataQuery<NewestExplorePageMediaResponse, NewestExplorePageMediaInput>(
        NEWEST_EXPLORE_PAGE_MEDIA_QUERY,
        {
            variables: page.direction === "next"
                ? { contentType: page.contentType, after: page.cursor ?? undefined, first: limit }
                : { contentType: page.contentType, before: page.cursor ?? undefined, last: limit },
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])

    const allMedia = data?.newestExploreMedia.edges.map((e) => e.node) ?? []
    const ifNextPage = data?.newestExploreMedia.pageInfo.hasNextPage ?? false
    const ifPrevPage = data?.newestExploreMedia.pageInfo.hasPreviousPage ?? false
    const nextCursor = data?.newestExploreMedia.pageInfo.endCursor ?? null
    const prevCursor = data?.newestExploreMedia.pageInfo.startCursor ?? null

    const handleNav = (goNext: boolean, cursor: string | null) => {
        setSlideDir(goNext ? "next" : "prev")
        setPageKey(k => k + 1)
        setPage({ direction: goNext ? "next" : "prev", cursor, contentType: page.contentType })
    }

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

import { useNavigate } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { BECAUSE_OF_REVIEWS_EXPLORE_MEDIA_QUERY } from "@/apollo/queries/media_queries"
import type { BecauseOfReviewsExploreMediaInput, BecauseOfReviewsExploreMediaResponse } from "@/types/queries/media_queries_types"
import { useDataQuery } from "@/apollo/useDataQuery"
import { useEffect, useState } from "react"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { MediaCard } from "@/features/media/components/MediaCard"

function verbForContentType(t: string) {
    if (t === "book") return "read"
    if (t === "game") return "played"
    return "watched"
}

export default function BecauseOfReviewsMediaLibrary({user: _user, setUser, currContentType, limit}: {user: User, setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all", limit: number}) {
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

    // only refetches on page changes
    const { data, loading, error } = useDataQuery<BecauseOfReviewsExploreMediaResponse, BecauseOfReviewsExploreMediaInput>(
        BECAUSE_OF_REVIEWS_EXPLORE_MEDIA_QUERY,
        {
            variables: page.direction === "next"
                ? { contentType: page.contentType, after: page.cursor ?? undefined, first: limit }
                : { contentType: page.contentType, before: page.cursor ?? undefined, last: limit },
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])


    const payload = data?.becauseOfReviewsExploreMedia ?? null
    const source = payload?.source ?? null
    const allMedia = payload?.media.edges.map((e) => e.node) ?? []
    const ifNextPage = payload?.media.pageInfo.hasNextPage ?? false
    const ifPrevPage = payload?.media.pageInfo.hasPreviousPage ?? false
    const nextCursor = payload?.media.pageInfo.endCursor ?? null
    const prevCursor = payload?.media.pageInfo.startCursor ?? null

    const handleNav = (goNext: boolean, cursor: string | null) => {
        setSlideDir(goNext ? "next" : "prev")
        setPageKey(k => k + 1)
        setPage({ direction: goNext ? "next" : "prev", cursor, contentType: page.contentType })
    }

    if (data && !payload) return null

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">
                    {source ? (
                        <>Because you {verbForContentType(source.contentType)} <span className="italic">{source.title}</span></>
                    ) : (
                        "Because of your reviews"
                    )}
                </span>
            </div>
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
        </section>
    )
}

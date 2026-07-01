import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { User } from "@/types/domain/user"
import type { Review } from "@/types/domain/review"
import { OBTAIN_TRENDING_REVIEWS_QUERY } from "@/apollo/queries/review_queries"
import type { ObtainTrendingReviewsInput, ObtainTrendingReviewsResponse } from "@/types/queries/review_queries_types"
import { useDataQuery } from "@/apollo/useDataQuery"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

type ContentType = "book" | "film" | "series" | "game" | "all"

type Props = {
    setUser: (user: User | null) => void
    currContentType: ContentType
    limit: number
}

export default function TrendingReviewsCarousel({ setUser, currContentType, limit }: Props) {
    const navigate = useNavigate()
    const [page, setPage] = useState<{
        direction: "next" | "prev"
        cursor: string | null
        contentType: ContentType
    }>({ direction: "next", cursor: null, contentType: currContentType })
    const [slideDir, setSlideDir] = useState<"next" | "prev">("next")
    const [pageKey, setPageKey] = useState(0)

    // Sync page state to contentType during render so useQuery variables never
    // send a stale cursor from the previous filter (the double-fetch bug the
    // other carousels also guard against).
    if (currContentType !== page.contentType) {
        setPage({ direction: "next", cursor: null, contentType: currContentType })
    }

    const { data, loading, error } = useDataQuery<ObtainTrendingReviewsResponse, ObtainTrendingReviewsInput>(
        OBTAIN_TRENDING_REVIEWS_QUERY,
        {
            variables: page.direction === "next"
                ? { contentType: page.contentType, after: page.cursor ?? undefined, first: limit }
                : { contentType: page.contentType, before: page.cursor ?? undefined, last: limit },
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])

    const reviews = data?.obtainTrendingReviews.edges.map((e) => e.node) ?? []
    const ifNextPage = data?.obtainTrendingReviews.pageInfo.hasNextPage ?? false
    const ifPrevPage = data?.obtainTrendingReviews.pageInfo.hasPreviousPage ?? false
    const nextCursor = data?.obtainTrendingReviews.pageInfo.endCursor ?? null
    const prevCursor = data?.obtainTrendingReviews.pageInfo.startCursor ?? null

    const handleNav = (goNext: boolean, cursor: string | null) => {
        setSlideDir(goNext ? "next" : "prev")
        setPageKey((k) => k + 1)
        setPage({ direction: goNext ? "next" : "prev", cursor, contentType: page.contentType })
    }

    if (!loading && reviews.length === 0) return null

    return (
        <div className="relative group/carousel">
            <div className="overflow-x-hidden overflow-y-visible py-1 px-1">
                <div
                    key={pageKey}
                    className={slideDir === "next" ? "slide-from-right" : "slide-from-left"}
                    style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}
                >
                    {loading
                        ? Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                        ))
                        : reviews.map((r) => <TrendingReviewCard key={r.id} review={r} />)
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

function TrendingReviewCard({ review }: { review: Review }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(`/review_info/${review.id}`)}
            className="flex items-start gap-3 bg-[#171519]/60 border border-white/5 hover:border-white/10 rounded-xl p-3 text-left transition h-full"
        >
            {review.media?.coverImage && (
                <img
                    src={review.media.coverImage}
                    alt={review.media.title}
                    className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                />
            )}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                {review.media?.title && (
                    <p className="text-sm font-semibold text-white truncate">{review.media.title}</p>
                )}
                <div className="flex items-center gap-1.5 min-w-0">
                    <img
                        src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    />
                    <span className="text-xs text-gray-400 truncate">{review.user.username}</span>
                    {review.rating != null && (
                        <span className="text-xs text-amber-300 ml-auto flex-shrink-0">★ {review.rating}</span>
                    )}
                </div>
                {review.content && (
                    <p className="text-xs text-gray-300 line-clamp-2">{review.content}</p>
                )}
            </div>
        </button>
    )
}

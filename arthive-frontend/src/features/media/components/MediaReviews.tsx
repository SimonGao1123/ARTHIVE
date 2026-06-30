import type { User } from "@/types/domain/user"
import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_REVIEWS_QUERY } from "@/apollo/queries/review_queries"
import type { ObtainMediaReviewsResponse, ObtainMediaReviewsInput, ReviewsMediaSortEnum } from "@/types/queries/review_queries_types"
import type { Review } from "@/types/domain/review"
import { obtainMediaReviewsFunction } from "@/data/reviews/obtainMediaReviews"
import ReviewCard from "@/features/reviews/components/ReviewCard"
import ArchivrChat from "@/features/archivr/components/ArchivrChat"
import { ArchivrLogo } from "@/shared/components/StyledComponents"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import SignInPrompt from "@/shared/components/SignInPrompt"

const LIMIT = 10


type MediaReviewsProps = {
    setUser: (user: User | null) => void
    user: User | null
    id: string
    reviewCount: number
    reviewChange?: { review: Review | null; nonce: number } | null
}

export default function MediaReviews({ setUser, user, id, reviewCount, reviewChange }: MediaReviewsProps) {
    const navigate = useNavigate()

    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [showArchivr, setShowArchivr] = useState(false)
    const [showArchivrSignIn, setShowArchivrSignIn] = useState(false)

    const [loadCount, setLoadCount] = useState(0)
    const [obtainMediaReviews, {error, loading}] = useLazyQuery<ObtainMediaReviewsResponse, ObtainMediaReviewsInput>(OBTAIN_MEDIA_REVIEWS_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [ifNextPage, setIfNextPage] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])

    const sentinelRef = useInfiniteScroll({
        hasNextPage: ifNextPage && !!user,
        loading,
        onLoadMore: () => setLoadCount(c => c + 1),
    })
    useEffect(() => {
        obtainMediaReviewsFunction(Number(id), cursor, setCursor, LIMIT, query, obtainMediaReviews, setReviews, navigate, setUser, setIfNextPage, sortBy)
    }, [loadCount])

    const [sortBy, setSortBy] = useState<ReviewsMediaSortEnum>("newest")

    useEffect(() => {
        setCursor(null)
        setReviews([])
        setLoadCount(prev => prev + 1)
    }, [query, sortBy])

    const reviewsTopRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!reviewChange) return
        const target = reviewChange.review
        setReviews(prev => {
            if (target == null) return prev
            const existing = prev.find(r => r.id === target.id)
            const filtered = prev.filter(r => r.id !== target.id)
            const merged: Review = existing
                ? {
                      ...target,
                      likeCount: existing.likeCount,
                      commentCount: existing.commentCount,
                      ifLiked: existing.ifLiked,
                      imageDetails: target.imageDetails.length > 0 ? target.imageDetails : existing.imageDetails,
                  }
                : target
            return [merged, ...filtered]
        })
        reviewsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, [reviewChange?.nonce])



    return (
        <div ref={reviewsTopRef} className="bg-[#171519] rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
            </h3>
            <div className="flex w-full border-b border-white/10 mb-5">
                {(["newest", "trending"] as ReviewsMediaSortEnum[]).map((sort) => {
                    const active = sortBy === sort
                    return (
                        <button
                            key={sort}
                            onClick={() => setSortBy(sort)}
                            className="flex-1 py-2.5 text-sm font-medium relative transition-all duration-150 capitalize hover:text-gray-300"
                            style={{ color: active ? "#a78bfa" : "#6b7280" }}
                            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af" }}
                            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#6b7280" }}
                        >
                            {sort === "newest" ? "Newest" : "Trending"}
                            <span
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full transition-opacity duration-150"
                                style={{ opacity: active ? 1 : 0 }}
                            />
                        </button>
                    )
                })}
            </div>

            <div className="flex gap-2 mb-5">
                <div className="flex-1 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search reviews"
                        value={currQuery}
                        onChange={(e) => setCurrQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery) }}
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                </div>
                <button
                    onClick={() => user ? setShowArchivr(true) : setShowArchivrSignIn(true)}
                    className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 rounded-full px-4 py-2 text-sm transition"
                >
                    <ArchivrLogo size={16} />
                    Ask Archivr
                </button>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error.message}</p>}
            {loading && <p className="text-gray-400 text-sm mb-4">Loading…</p>}

            <div className="flex flex-col">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} setUser={setUser} review={review} user={user ?? null} />
                ))}
            </div>

            {ifNextPage && (user ? (
                <div ref={sentinelRef} className="h-1" />
            ) : (
                <div className="mt-4">
                    <SignInPrompt title="Sign in to see more reviews" message="Sign in to keep scrolling through reviews." />
                </div>
            ))}

            {user && (
                <ArchivrChat
                    mediaId={id}
                    setUser={setUser}
                    isOpen={showArchivr}
                    onClose={() => setShowArchivr(false)}
                />
            )}

            {showArchivrSignIn && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowArchivrSignIn(false)}
                >
                    <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <SignInPrompt
                            title="Sign in to use Archivr"
                            message="Archivr is your AI companion for ARTHIVE. Sign in to chat about this media."
                        />
                    </div>
                </div>
            )}
        </div>
    )

}

import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_REVIEWS_QUERY, type ObtainMediaReviewsResponse, type ObtainMediaReviewsInput, type ReviewsMediaSortEnum } from "../types/queries/media_request_query"
import type { Review } from "../types/review_type"
import { obtainMediaReviewsFunction } from "../data/obtain_media_reviews"
import ReviewCard from "../lib/ReviewCard"

const LIMIT = 2


export default function MediaReviews({ setUser, id}: {setUser: (user: User | null) => void, id: string} ) {
    const navigate = useNavigate()

    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")

    const [loadCount, setLoadCount] = useState(0)
    const [obtainMediaReviews, {error, loading}] = useLazyQuery<ObtainMediaReviewsResponse, ObtainMediaReviewsInput>(OBTAIN_MEDIA_REVIEWS_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [ifNextPage, setIfNextPage] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])
    useEffect(() => {
        obtainMediaReviewsFunction(Number(id), cursor, setCursor, LIMIT, query, obtainMediaReviews, setReviews, navigate, setUser, setIfNextPage, sortBy)
    }, [loadCount])

    const [sortBy, setSortBy] = useState<ReviewsMediaSortEnum>("newest")

    useEffect(() => {
        setCursor(null)
        setReviews([])
        setLoadCount(prev => prev + 1)
    }, [query, sortBy])



    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6">
            <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
                    <input
                        type="text"
                        placeholder="Search reviews"
                        value={currQuery}
                        onChange={(e) => setCurrQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery) }}
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                </div>
                <button
                    disabled={query === currQuery}
                    onClick={() => setQuery(currQuery)}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Search
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button
                    disabled={sortBy === "newest"}
                    onClick={() => setSortBy("newest")}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Newest
                </button>
                <button
                    disabled={sortBy === "trending"}
                    onClick={() => setSortBy("trending")}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Trending
                </button>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error.message}</p>}
            {loading && <p className="text-gray-400 text-sm mb-4">Loading…</p>}

            <div className="flex flex-col">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} setUser={setUser} review={review} />
                ))}
            </div>

            {ifNextPage && (
                <button
                    onClick={() => setLoadCount(loadCount + 1)}
                    className="w-full text-violet-400 hover:text-violet-300 py-3 text-sm transition mt-2"
                >
                    Load More
                </button>
            )}
        </div>
    )

}

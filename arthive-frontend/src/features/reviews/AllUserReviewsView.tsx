import { useEffect, useState } from "react"
import type { User } from "@/types/domain/user"
import type { AllReview } from "@/types/domain/review"
import { useLazyQuery } from "@apollo/client/react"
import type { ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput } from "@/types/queries/review_queries_types"
import { OBTAIN_ALL_USER_REVIEWS_QUERY } from "@/apollo/queries/review_queries"
import { useNavigate, useParams } from "react-router-dom"
import ContentFilter from "@/shared/components/ContentFilter"
import { obtainAllUserReviewsFunction } from "@/data/reviews/obtainAllUserReviews"
import ReviewCard from "@/features/reviews/components/ReviewCard"
import { NumberedPagination } from "@/shared/components/NumberedPagination"
import SignInPrompt from "@/shared/components/SignInPrompt"

const LIMIT = 10
export default function AllUserReviewsPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    const [reviews, setReviews] = useState<AllReview[]>([])
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")

    const [getAllReviews] = useLazyQuery<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput>(OBTAIN_ALL_USER_REVIEWS_QUERY, {
        fetchPolicy: "no-cache",
    })

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    const handleContentTypeChange = (next: "book" | "film" | "series" | "game" | "all") => {
        if (next === contentType) return
        setReviews([])
        setPageNum(1)
        setContentType(next)
    }

    useEffect(() => {
        if (!user_id || !user) return
        obtainAllUserReviewsFunction(user_id, contentType, pageNum, LIMIT, query, setTotalPages, getAllReviews, setReviews, setTargetUser, navigate, setUser)
    }, [contentType, pageNum, query, user])

    if (!user) return <SignInPrompt title="Sign in to view reviews" message="Sign in to browse user reviews." />

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{targetUser?.username ? `${targetUser.username}'s Reviews` : "Reviews"}</h1>
            </div>

            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
                        <input
                            type="text"
                            placeholder="Search reviews"
                            value={currQuery}
                            onChange={(e) => setCurrQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && currQuery !== query) setQuery(currQuery) }}
                            className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <button
                        disabled={currQuery === query}
                        onClick={() => setQuery(currQuery)}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                    >
                        Search
                    </button>
                </div>

                <div className="flex flex-col">
                    {reviews.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-6">No reviews found.</p>
                    )}
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} setUser={setUser} review={review} user={user ?? null} />
                    ))}
                </div>

                <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
            </div>
        </div>
    )
}

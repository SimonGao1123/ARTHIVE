import { useEffect, useState } from "react"
import type { User } from "../types/user_types"
import type { AllReview } from "../types/review_type"
import { useLazyQuery } from "@apollo/client/react"
import type { ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput } from "../types/queries/review_request_queries"
import { OBTAIN_ALL_USER_REVIEWS_QUERY } from "../types/queries/review_request_queries"
import { useNavigate, useParams } from "react-router-dom"
import ContentFilter from "../lib/ContentFilter"
import { obtainAllUserReviewsFunction } from "../data/obtain_all_user_reviews"
import ReviewCard from "../lib/ReviewCard"
import { NumberedPagination } from "../lib/NumberedPagination"

const LIMIT = 2
export default function AllUserReviewsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    if (!user_id) {
        navigate("/")
        return
    }
    const [reviews, setReviews] = useState<AllReview[]>([])
    const [targetUser, setTargetUser] = useState<User | null>(null)

    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")

    const [currQuery, setCurrQuery] = useState<string>("")

    const [totalPages, setTotalPages] = useState<number>(0)

    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")

    const [getAllReviews] = useLazyQuery<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput>(OBTAIN_ALL_USER_REVIEWS_QUERY)
    
    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setReviews([])
        setPageNum(1)
        setContentType(nextContentType)
    }


    useEffect(() => {
        obtainAllUserReviewsFunction(user_id, contentType, pageNum, LIMIT, query, setTotalPages, getAllReviews, setReviews, setTargetUser, navigate, setUser)
    }, [contentType, pageNum, query])

    return (
        <div>
            <h1>{targetUser?.username}'s Reviews</h1>
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            <input type="text" placeholder="Search" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
            <button disabled={currQuery === query} onClick={() => setQuery(currQuery)}>Search</button>
            {reviews.map((review) => (
                <ReviewCard key={review.id} setUser={setUser} review={review} />
            ))}
            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

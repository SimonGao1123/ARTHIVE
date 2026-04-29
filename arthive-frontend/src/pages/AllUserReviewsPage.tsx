import { useEffect, useState } from "react"
import type { User } from "../types/user_types"
import type { AllReview } from "../types/review_type"
import { useLazyQuery } from "@apollo/client/react"
import type { ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput } from "../types/queries/review_request_queries"
import { OBTAIN_ALL_USER_REVIEWS_QUERY } from "../types/queries/review_request_queries"
import { useNavigate } from "react-router-dom"
import ContentFilter from "../lib/ContentFilter"
import { obtainAllUserReviewsFunction } from "../data/obtain_all_user_reviews"
import DisplayRating from "../lib/DisplayRating"
import { useLocation } from "react-router-dom"
import ReviewCard from "../lib/ReviewCard"

const LIMIT = 2
export default function AllUserReviewsPage({setUser}: {setUser: (user: User | null) => void}) {
    const [reviews, setReviews] = useState<AllReview[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [ifNextPage, setIfNextPage] = useState<boolean>(true)
    const navigate = useNavigate()
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [getAllReviews] = useLazyQuery<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput>(OBTAIN_ALL_USER_REVIEWS_QUERY)
    
    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setReviews([])
        setPageNum(1)
        setContentType(nextContentType)
        setIfNextPage(true)
    }


    useEffect(() => {
        obtainAllUserReviewsFunction(contentType, pageNum, LIMIT, getAllReviews, setReviews, navigate, setUser, setIfNextPage)
    }, [contentType, pageNum])

    console.log(reviews)
    console.log(pageNum)
    return (
        <div>
            <h1>All User Reviews</h1>
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            {reviews.map((review) => (
                <ReviewCard key={review.id} setUser={setUser} review={review} />
            ))}
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
        </div>
    )
}

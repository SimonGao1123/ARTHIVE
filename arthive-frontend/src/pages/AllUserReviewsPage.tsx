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

const LIMIT = 2
export default function AllUserReviewsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    if (!user_id) {
        navigate("/")
        return
    }
    const [reviews, setReviews] = useState<{reviews: AllReview[], user: {id: string, username: string}}>({ reviews: [], user: { id: "", username: "" } })
    const [pageNum, setPageNum] = useState<number>(1)   
    const [ifNextPage, setIfNextPage] = useState<boolean>(true)
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [getAllReviews] = useLazyQuery<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput>(OBTAIN_ALL_USER_REVIEWS_QUERY)
    
    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setReviews({ reviews: [], user: reviews.user })
        setPageNum(1)
        setContentType(nextContentType)
        setIfNextPage(true)
    }


    useEffect(() => {
        obtainAllUserReviewsFunction(user_id, contentType, pageNum, LIMIT, getAllReviews, setReviews, navigate, setUser, setIfNextPage)
    }, [contentType, pageNum])

    console.log(reviews)
    console.log(pageNum)
    return (
        <div>
            <h1>{reviews.user.username}'s Reviews</h1>
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            {reviews.reviews.map((review) => (
                <ReviewCard key={review.id} setUser={setUser} review={review} />
            ))}
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
        </div>
    )
}

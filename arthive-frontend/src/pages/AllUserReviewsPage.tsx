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

const LIMIT = 10
export default function AllUserReviewsPage({setUser}: {setUser: (user: User | null) => void}) {
    const [reviews, setReviews] = useState<AllReview[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [ifNextPage, setIfNextPage] = useState<boolean>(true)
    const navigate = useNavigate()
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "all">("all")
    const [getAllReviews] = useLazyQuery<ObtainAllUserReviewsResponse, ObtainAllUserReviewsInput>(OBTAIN_ALL_USER_REVIEWS_QUERY)

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "all") => {
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
            <ReviewList reviews={reviews} />
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
        </div>
    )
}

function ReviewList({reviews}: {reviews: AllReview[]}) {
    const navigate = useNavigate()
    return (
        <div>
            {reviews.map((review) => (
                <div key={review.id}>
                    <h2>{review.media.title}</h2>
                    <img onClick={() => navigate(`/media/all-reviews/${review.media.id}`)} width={50} height={50} src={review.media.coverImage ?? "/default-ARTHIVE-cover.png"} alt="Cover Image" />
                    <p>By: {review.media.creator}</p>
                    <p>Year: {review.media.year}</p>
                    <p>{review.content}</p>
                    <DisplayRating rating={review.rating ?? 0} />
                    <p>{review.ifFavorite ? "Favorite" : "Not Favorite"}</p>
                    <p>{review.ifFinished ? "Finished" : "Not Finished"}</p>
                    <p>{review.updatedAt}</p>
                </div>
            ))}
        </div>
    )
}
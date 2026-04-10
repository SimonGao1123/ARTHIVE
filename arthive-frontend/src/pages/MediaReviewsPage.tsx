import type { User } from "../types/user_types"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_REVIEWS_QUERY, type ObtainMediaReviewsResponse, type ObtainMediaReviewsInput } from "../types/queries/media_request_query"
import type { Review } from "../types/review_type"
import { obtainMediaReviewsFunction } from "../data/obtain_media_reviews"
import DisplayRating from "../lib/DisplayRating"
import ReviewCard from "../lib/ReviewCard"

const LIMIT = 10

// TODO: OBTAIN MEDIA INFORMATION AND DISPLAY IT ON THE PAGE

export default function MediaReviewsPage({ setUser}: {setUser: (user: User | null) => void} ) {
    const location = useLocation()
    const prev_page = location.pathname.split("/").slice(1, -1).join("/")
    const {id} = useParams()
    const navigate = useNavigate()

    // the farthest page num loaded
    const [pageNum, setPageNum] = useState(1)
    const [obtainMediaReviews, {error, loading}] = useLazyQuery<ObtainMediaReviewsResponse, ObtainMediaReviewsInput>(OBTAIN_MEDIA_REVIEWS_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [ifNextPage, setIfNextPage] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])
    console.log(reviews)
    useEffect(() => {
        obtainMediaReviewsFunction(Number(id), pageNum, LIMIT, obtainMediaReviews, setReviews, navigate, setUser, setIfNextPage)
    }, [pageNum])


    console.log(pageNum)
    return (
        <div>
            <button onClick={() => navigate(`/${prev_page}`)}>Back</button>
            <p>{error?.message}</p>
            {loading ? <p>"Loading..."</p> : <></>}
            <h1>Media Reviews</h1>
            {reviews.map((review) => (
                <ReviewCard key={review.id} setUser={setUser} review={review} />
            ))}
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
        </div>
    )

}

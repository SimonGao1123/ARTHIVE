import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_REVIEWS_QUERY, type ObtainMediaReviewsResponse, type ObtainMediaReviewsInput } from "../types/queries/media_request_query"
import type { Review } from "../types/review_type"
import { obtainMediaReviewsFunction } from "../data/obtain_media_reviews"
import ReviewCard from "../lib/ReviewCard"

const LIMIT = 2


export default function MediaReviews({ setUser, id}: {setUser: (user: User | null) => void, id: string} ) {
    const navigate = useNavigate()

    // for updating the reviews when a user updates a review

    // the farthest page num loaded
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
        obtainMediaReviewsFunction(Number(id), cursor, setCursor, LIMIT, query, obtainMediaReviews, setReviews, navigate, setUser, setIfNextPage)
    }, [loadCount])

    useEffect(() => {
        setCursor(null)
        setReviews([])
        setLoadCount(prev => prev + 1)
    }, [query])


    return (
        <div>
            <p>{error?.message}</p>
            {loading ? <p>"Loading..."</p> : <></>}
            <h1>Media Reviews</h1>
            <input type="text" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
            <button disabled={query === currQuery} onClick={() => setQuery(currQuery)}>Search</button>
            {reviews.map((review) => (
                <ReviewCard key={review.id} setUser={setUser} review={review} />
            ))}
            {ifNextPage && <button onClick={() => setLoadCount(loadCount + 1)}>Load More</button>}
        </div>
    )

}

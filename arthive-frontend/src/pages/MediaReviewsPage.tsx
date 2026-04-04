import type { User } from "../types/user_types"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_REVIEWS_QUERY, type ObtainMediaReviewsResponse, type ObtainMediaReviewsInput } from "../types/queries/media_request_query"
import type { Review } from "../types/review_type"
import { obtainMediaReviewsFunction } from "../data/obtain_media_reviews"
import DisplayRating from "../lib/DisplayRating"

const LIMIT = 10

// TODO: OBTAIN MEDIA INFORMATION AND DISPLAY IT ON THE PAGE

export default function MediaReviewsPage({setUser}: {setUser: (user: User | null) => void} ) {
    const location = useLocation()
    const prev_page = location.pathname.split("/").slice(1, -1).join("/")
    console.log(prev_page)
    const {id} = useParams()
    const navigate = useNavigate()
    // the farthest page num loaded
    const [pageNum, setPageNum] = useState(1)
    const [obtainMediaReviews, {error, loading}] = useLazyQuery<ObtainMediaReviewsResponse, ObtainMediaReviewsInput>(OBTAIN_MEDIA_REVIEWS_QUERY)
    const [ifNextPage, setIfNextPage] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])
    console.log(reviews)
    useEffect(() => {
        obtainMediaReviewsFunction(Number(id), pageNum, LIMIT, obtainMediaReviews, setReviews, navigate, setUser, reviews, setIfNextPage)
    }, [pageNum])
    return (
        <div>
            <button onClick={() => navigate(`/${prev_page}`)}>Back</button>
            <p>{error?.message}</p>
            {loading ? <p>"Loading..."</p> : <></>}
            <h1>Media Reviews</h1>
            {reviews.map((review) => <Review review_data={review} />)}
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
        </div>
    )

}

// TODO: MUCH LATER ALLOW CLICKING ON USER PROFILE PICTURE TO GO TO THEIR PROFILE PAGE
function Review({review_data}: {review_data: Review}) {
    return (
        <div>
            <p>{review_data.user.username}</p>
            <p>{review_data.content}</p>
            <DisplayRating rating={review_data.rating ?? 0}/>
            <p>{review_data.ifFavorite ? "Favorite" : "Not Favorite"}</p>
            <p>{review_data.ifFinished ? "Finished" : "Not Finished"}</p>
            <p>{review_data.updatedAt}</p>
            <img width={50} height={50} src={review_data.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" />
        </div>
    )
    
}
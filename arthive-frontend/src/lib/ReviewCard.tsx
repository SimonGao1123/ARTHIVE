import { useLocation, useNavigate } from "react-router-dom"
import { encodeReturnPath } from "./prevPageRouting"
import DisplayRating from "./DisplayRating"
import { useMutation } from "@apollo/client/react"
import { LIKE_REVIEW_MUTATION, type LikeReviewInput, type LikeReviewResponse } from "../types/mutations/like_review_mutation"
import { useState } from "react"
import type { User } from "../types/user_types"
import { likeReviewFunction } from "../data/like_review"

export default function ReviewCard({review, setUser}: {review: any, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const location = useLocation()

    const [currLiked, setCurrLiked] = useState<boolean>(review.ifLiked)
    const [likeCount, setLikeCount] = useState<number>(review.likeCount)

    const [likeReview, {loading, error}] = useMutation<LikeReviewResponse, LikeReviewInput>(LIKE_REVIEW_MUTATION)
    if (error) {
        console.log("error in likeReview", error.message)
    }
    return (
        <div key={review.id}>
                    { review?.media?.title ? <h2>{review.media.title}</h2> : <></>}
                    { review?.media?.id ? 
                        <img onClick={() => navigate(`/media/all_reviews/${review.media.id}`)} width={50} height={50} src={review.media.coverImage ?? "/default-ARTHIVE-cover.png"} alt="Cover Image" />
                    : <></>}
                    { review?.media?.creator ? <p>By: {review.media.creator}</p> : <></>}
                    { review?.media?.year ? <p>Year: {review.media.year}</p> : <></>}
                    { review?.user?.username ? <p>By: {review.user.username}</p> : <></>}
                    { review?.user?.id ? <img width={50} height={50} src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" /> : <></>}
                    { review?.content !== null ? <p>{review.content}</p> : <></>}
                    { review?.rating !== null ? <DisplayRating rating={review.rating} /> : <></>}
                    <p>{review.ifFavorite ? "Favorite" : "Not Favorite"}</p> 
                    <p>{review.ifFinished ? "Finished" : "Not Finished"}</p>
                    <p>{review.updatedAt}</p>
                    {review.content && 
                    <>
                    <p onClick={() => likeReviewFunction(setCurrLiked, likeReview, review.id, setUser, navigate, setLikeCount)}>{likeCount} {loading ? "Loading..." : currLiked ? "❤️" : "🤍"}</p>
                    <p onClick={() => navigate(`/${encodeReturnPath(location.pathname)}/review_info/${review.id}`)}>{review.commentCount} 💬</p>
                    </>}
                    <p>======================================================</p>
        </div>
    )
}
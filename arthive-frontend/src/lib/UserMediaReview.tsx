import type { UserReview } from "../types/review_type";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client/react";
import { OBTAIN_USER_REVIEW_QUERY, type ObtainUserReviewResponse, type ObtainUserReviewInput } from "../types/queries/review_request_queries";
import { obtainUserMediaReview } from "../data/obtain_user_media_review";
import StarRatingMedia from "./StarRatingMedia";
import { useMutation } from "@apollo/client/react";
import { CREATE_REVIEW_MUTATION, type CreateReviewInput, type CreateReviewResponse } from "../types/mutations/create_review_mutation";
import { createReviewFunction } from "../data/create_review.ts";
import DeleteReviewPopup from "./DeleteReviewPopup.tsx";

export default function UserMediaReview({mediaId, setUser, mediaInfo}: any) {

    const {title, coverImage, creator, year} = mediaInfo
    const navigate = useNavigate()
    const [getUserMediaReview] = useLazyQuery<ObtainUserReviewResponse, ObtainUserReviewInput>(OBTAIN_USER_REVIEW_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [userReview, setUserReview] = useState<UserReview | null>(null)
    
    const [reviewContent, setReviewContent] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [ifFavorite, setIfFavorite] = useState<boolean>(false)
    const [ifFinished, setIfFinished] = useState<boolean>(false)

    const [showWriteReviewContent, setShowWriteReviewContent] = useState<boolean>(false)
    
    useEffect(() => {
        obtainUserMediaReview(setUserReview, getUserMediaReview, mediaId, navigate, setUser)
        
    }, [mediaId])
    useEffect(() => {
        if (userReview) {
            setReviewContent(userReview.content || "")
            setRating(userReview.rating || 0)
            setIfFavorite(userReview.ifFavorite)
            setIfFinished(userReview.ifFinished)
        } else {
            setUserReview(null)
            setReviewContent("")
            setRating(0)
            setIfFavorite(false)
            setIfFinished(false)
        }
    }, [userReview])

    

    const [createReview] = useMutation<CreateReviewResponse, CreateReviewInput>(CREATE_REVIEW_MUTATION)
    
    function createReviewFunctionWrapper({newIfFavorite = ifFavorite, newIfFinished = ifFinished, newReviewContent = reviewContent, newRating = rating}: {newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) {
        createReviewFunction(newReviewContent, newRating, newIfFavorite, newIfFinished, userReview, setUserReview, mediaId, createReview, setUser, navigate)
    }

    const [showDeleteReviewPopup, setShowDeleteReviewPopup] = useState<boolean>(false)
    return (
        <div>
            {showWriteReviewContent ? (
                <WriteReviewContent reviewContent={reviewContent} title={title} coverImage={coverImage} creator={creator} year={year} setShowWriteReviewContent={setShowWriteReviewContent} createReviewFunctionWrapper={createReviewFunctionWrapper}/>
            ) : (
                <button onClick={() => setShowWriteReviewContent(true)}>{reviewContent ? "Edit" : "Write"} a review</button>
            )}

            {showDeleteReviewPopup ? (
                <DeleteReviewPopup setShowDeleteReviewPopup={setShowDeleteReviewPopup} createReviewFunctionWrapper={createReviewFunctionWrapper}/>
            ) : <></>}
            <StarRatingMedia rating={rating} setRating={setRating} createReviewFunctionWrapper={createReviewFunctionWrapper}/>
            <button onClick={() => {
                createReviewFunctionWrapper({newIfFavorite: !ifFavorite})
            }}>{ifFavorite ? "Remove from favorites" : "Add to favorites"}</button>
            <button onClick={() => { 
                if (ifFinished && (reviewContent || rating)) {
                    setShowDeleteReviewPopup(true)
                    return
                }
                createReviewFunctionWrapper({newIfFinished: !ifFinished})
                
                }}>{ifFinished ? "Mark as not finished" : "Mark as finished"}</button>
        </div>
    )
}

function WriteReviewContent({reviewContent, title, coverImage, creator, year, setShowWriteReviewContent, createReviewFunctionWrapper}: 
    {reviewContent: string, title: string, coverImage: string, creator: string, year: number, setShowWriteReviewContent: (showWriteReviewContent: boolean) => void, createReviewFunctionWrapper: (params: {newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void}) {
    const [content, setContent] = useState<string>(reviewContent)
    return (
        <div>
            <button onClick={() => setShowWriteReviewContent(false)}>Back</button>
            <p>{reviewContent ? "Edit" : "Write"} a review for...</p>
            <h1>{title}</h1>
            <p>{year}</p>
            <p>By {creator}</p>
            <img src={coverImage} alt={title} loading="lazy"/>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}/>
            <button onClick={() => {

                if (content.length > 1000) {
                    alert("Review content cannot be longer than 1000 characters")
                    return
                }
                createReviewFunctionWrapper({newReviewContent: content.trim()})
                setShowWriteReviewContent(false)
            }}>{reviewContent ? "Update" : "Post"}</button>
            
        </div>
    )
}

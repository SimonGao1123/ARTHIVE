import type { UserReview } from "../types/review_type";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client/react";
import { OBTAIN_USER_REVIEW_QUERY, type ObtainUserReviewResponse, type ObtainUserReviewInput } from "../types/queries/review_request_query";
import { obtainUserMediaReview } from "../data/obtain_user_media_review";
import StarRatingMedia from "./StarRatingMedia";
import { useMutation } from "@apollo/client/react";
import { CREATE_REVIEW_MUTATION, type CreateReviewInput } from "../types/mutations/create_review_mutation";
import { createReviewFunction } from "../data/create_review.ts";

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
    const skipNextAutoSave = useRef<boolean>(true)

    const [showWriteReviewContent, setShowWriteReviewContent] = useState<boolean>(false)
    
    useEffect(() => {
        skipNextAutoSave.current = true
        obtainUserMediaReview(setUserReview, getUserMediaReview, mediaId, navigate, setUser)
        
    }, [mediaId])
    useEffect(() => {
        skipNextAutoSave.current = true
        if (userReview) {
            setReviewContent(userReview.content || "")
            setRating(userReview.rating || 0)
            setIfFavorite(userReview.ifFavorite)
            setIfFinished(userReview.ifFinished)
        }
    }, [userReview])
    
    console.log(userReview)

    const [createReview] = useMutation<ObtainUserReviewResponse, CreateReviewInput>(CREATE_REVIEW_MUTATION)
    useEffect(() => {
        if (skipNextAutoSave.current) {
            skipNextAutoSave.current = false
            return
        }
        createReviewFunction(reviewContent, rating, ifFavorite, ifFinished, userReview, setUserReview, mediaId, createReview, setUser, navigate)
    
    }, [reviewContent, rating, ifFavorite, ifFinished])
    console.log("IMPORTANT: rating in UserMediaReview", rating)
    return (
        <div>
            {showWriteReviewContent ? (
                <WriteReviewContent reviewContent={reviewContent} setReviewContent={setReviewContent} title={title} coverImage={coverImage} creator={creator} year={year} setShowWriteReviewContent={setShowWriteReviewContent}/>
            ) : (
                <button onClick={() => setShowWriteReviewContent(true)}>{reviewContent ? "Edit" : "Write"} a review</button>
            )}
            <StarRatingMedia rating={rating} setRating={setRating}/>
            <button onClick={() => setIfFavorite(!ifFavorite)}>{ifFavorite ? "Remove from favorites" : "Add to favorites"}</button>
            <button onClick={() => setIfFinished(!ifFinished)}>{ifFinished ? "Mark as not finished" : "Mark as finished"}</button>
        </div>
    )
}

function WriteReviewContent({reviewContent, setReviewContent, title, coverImage, creator, year, setShowWriteReviewContent}: 
    {reviewContent: string, setReviewContent: (reviewContent: string) => void, title: string, coverImage: string, creator: string, year: number, setShowWriteReviewContent: (showWriteReviewContent: boolean) => void}) {
    const [content, setContent] = useState<string>(reviewContent)
    return (
        <div>
            <button onClick={() => setShowWriteReviewContent(false)}>Back</button>
            <p>{reviewContent ? "Edit" : "Write"} a review for...</p>
            <h1>{title}</h1>
            <p>{year}</p>
            <p>By {creator}</p>
            <img src={coverImage} alt={title} loading="lazy"/>
            <input type="textarea" value={content} onChange={(e) => setContent(e.target.value)}/>
            <button onClick={() => {
                if (content.trim() === "") {
                    alert("Review content cannot be empty")
                    return
                }
                if (content.length > 1000) {
                    alert("Review content cannot be longer than 1000 characters")
                    return
                }
                setReviewContent(content)
                setShowWriteReviewContent(false)
            }}>{reviewContent ? "Update" : "Post"}</button>
            
        </div>
    )
}

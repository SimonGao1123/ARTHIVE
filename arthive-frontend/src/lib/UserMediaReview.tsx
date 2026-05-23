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

type UserMediaReviewProps = {
    mediaId: number
    setUser: any
    mediaInfo: any
    onOpenAddToLists?: () => void
}

export default function UserMediaReview({mediaId, setUser, mediaInfo, onOpenAddToLists}: UserMediaReviewProps) {

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
        <>
            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col items-center gap-4">
                <StarRatingMedia rating={rating} setRating={setRating} createReviewFunctionWrapper={createReviewFunctionWrapper}/>

                <div className="w-full flex flex-col gap-1.5">
                    <SelectionButton
                        active={ifFinished}
                        activeColor="emerald"
                        icon={ifFinished ? <EyeIcon /> : <EyeOffIcon />}
                        label={ifFinished ? "Watched" : "Mark Watched"}
                        onClick={() => {
                            if (ifFinished && (reviewContent || rating)) {
                                setShowDeleteReviewPopup(true)
                                return
                            }
                            createReviewFunctionWrapper({newIfFinished: !ifFinished})
                        }}
                    />

                    <button
                        onClick={() => setShowWriteReviewContent(true)}
                        className="group w-full py-3 px-4 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <PencilIcon />
                        <span>{reviewContent ? "Edit review" : "Write a review"}</span>
                    </button>

                    {onOpenAddToLists && (
                        <button
                            onClick={onOpenAddToLists}
                            className="group w-full py-3 px-4 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ListIcon />
                            <span>Add to Lists</span>
                        </button>
                    )}

                    <SelectionButton
                        active={ifFavorite}
                        activeColor="pink"
                        icon={<HeartIcon filled={ifFavorite} />}
                        label={ifFavorite ? "Favorited" : "Add to favorites"}
                        onClick={() => createReviewFunctionWrapper({newIfFavorite: !ifFavorite})}
                    />
                </div>
            </div>

            {showDeleteReviewPopup ? (
                <DeleteReviewPopup setShowDeleteReviewPopup={setShowDeleteReviewPopup} createReviewFunctionWrapper={createReviewFunctionWrapper}/>
            ) : null}

            {showWriteReviewContent && (
                <WriteReviewModal
                    reviewContent={reviewContent}
                    title={title}
                    coverImage={coverImage}
                    creator={creator}
                    year={year}
                    setShowWriteReviewContent={setShowWriteReviewContent}
                    createReviewFunctionWrapper={createReviewFunctionWrapper}
                />
            )}
        </>
    )
}

type SelectionButtonProps = {
    active: boolean
    activeColor: "emerald" | "pink"
    icon: React.ReactNode
    label: string
    onClick: () => void
}

function SelectionButton({ active, activeColor, icon, label, onClick }: SelectionButtonProps) {
    // Static class strings so Tailwind keeps them in the build.
    const activeStyles =
        activeColor === "emerald"
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_18px_-4px_rgba(16,185,129,0.35)]"
            : "bg-pink-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_18px_-4px_rgba(236,72,153,0.45)]"

    return (
        <button
            onClick={onClick}
            className={
                "group w-full py-3 px-4 text-sm rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 " +
                (active
                    ? activeStyles + " scale-[1.02]"
                    : "border-transparent text-gray-300 hover:text-white hover:bg-white/5")
            }
        >
            <span
                className={
                    "inline-flex items-center justify-center transition-transform duration-300 " +
                    (active ? "scale-110" : "group-hover:scale-105")
                }
            >
                {icon}
            </span>
            <span>{label}</span>
        </button>
    )
}

function WriteReviewModal({reviewContent, title, coverImage, creator, year, setShowWriteReviewContent, createReviewFunctionWrapper}:
    {reviewContent: string, title: string, coverImage: string, creator: string, year: number, setShowWriteReviewContent: (showWriteReviewContent: boolean) => void, createReviewFunctionWrapper: (params: {newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void}) {
    const [content, setContent] = useState<string>(reviewContent)
    const remaining = 1000 - content.length

    const submit = () => {
        if (content.length > 1000) return
        createReviewFunctionWrapper({newReviewContent: content.trim()})
        setShowWriteReviewContent(false)
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="write-review-title"
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onClick={() => setShowWriteReviewContent(false)}
        >
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <p id="write-review-title" className="text-xs text-gray-400 uppercase tracking-wider">
                        {reviewContent ? "Edit your review" : "Write a review"}
                    </p>
                    <button
                        onClick={() => setShowWriteReviewContent(false)}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="flex gap-4">
                    {coverImage ? (
                        <img src={coverImage} alt={title} loading="lazy" className="w-24 h-auto rounded-lg object-cover flex-shrink-0"/>
                    ) : null}
                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-xl font-bold text-white truncate">{title}</h1>
                        <p className="text-gray-400 text-sm">{year}</p>
                        <p className="text-gray-400 text-sm">By {creator}</p>
                    </div>
                </div>

                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts…"
                    className="w-full min-h-48 bg-[#0a090c] border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-y transition-colors"
                />

                <div className="flex items-center justify-between gap-3">
                    <span className={"text-xs " + (remaining < 0 ? "text-red-400" : remaining < 100 ? "text-amber-400" : "text-gray-500")}>
                        {remaining} characters left
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowWriteReviewContent(false)}
                            className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={remaining < 0}
                            className="bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm transition"
                        >
                            {reviewContent ? "Update" : "Post"}
                        </button>

                        {
                            reviewContent &&
                            <button
                                onClick={() => {
                                    createReviewFunctionWrapper({newReviewContent: ""})
                                    setShowWriteReviewContent(false)
                                }
                                
                                }
                                className="px-4 py-2 rounded-full text-sm text-red-500 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
                            >
                                Delete Review
                                <TrashIcon />
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
    )
}
function EyeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A10 10 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
    )
}

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transition: "fill 200ms ease-out" }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    )
}

function PencilIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
    )
}

function ListIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
    )
}

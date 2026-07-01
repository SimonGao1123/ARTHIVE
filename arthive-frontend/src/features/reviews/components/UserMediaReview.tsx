import type { UserReview } from "@/types/domain/review";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataQuery } from "@/apollo/useDataQuery";
import { OBTAIN_USER_REVIEW_QUERY } from "@/apollo/queries/review_queries"
import type { ObtainUserReviewResponse, ObtainUserReviewInput } from "@/types/queries/review_queries_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth";
import StarRatingMedia from "./StarRatingMedia";
import { useMutation } from "@apollo/client/react";
import { CREATE_REVIEW_MUTATION } from "@/apollo/mutations/review_mutations"
import { REMOVE_ATTACHED_IMAGE_MUTATION } from "@/apollo/mutations/shared_mutations"
import type { CreateReviewInput, CreateReviewResponse } from "@/types/mutations/review_mutations_types"
import type { RemoveAttachedImageInput, RemoveAttachedImageResponse } from "@/types/mutations/shared_mutations_types"
import { createReviewFunction } from "@/data/reviews/createReview.ts";
import DeleteReviewPopup from "@/features/reviews/components/DeleteReviewPopup";
import { EyeIcon, EyeOffIcon, PencilIcon, ListIcon, HeartIcon, TrashIcon, ImageIcon } from "@/shared/components/StyledComponents";
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "@/apollo/mutations/shared_mutations"
import { removeAttachedImageFunction } from "@/data/media/removeImageAttachment.ts";
import PreviewImageDisplay from "@/shared/components/PreviewImageDisplay";
import { handleAttachImages } from "@/shared/utils/handleImageUpload";

type UserMediaReviewProps = {
    mediaId: number
    setUser: any
    mediaInfo: any
    onOpenAddToLists?: () => void
    onReviewChanged?: (review: UserReview | null) => void
}

export default function UserMediaReview({mediaId, setUser, mediaInfo, onOpenAddToLists, onReviewChanged}: UserMediaReviewProps) {

    const {title, coverImage, creator, year} = mediaInfo
    const navigate = useNavigate()
    const { data: userReviewData, error: userReviewError } = useDataQuery<ObtainUserReviewResponse, ObtainUserReviewInput>(
        OBTAIN_USER_REVIEW_QUERY,
        { variables: { mediaId }, skip: !mediaId, fetchPolicy: "no-cache" }
    )
    const [userReview, setUserReview] = useState<UserReview | null>(null)

    const [reviewContent, setReviewContent] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [ifFavorite, setIfFavorite] = useState<boolean>(false)
    const [ifFinished, setIfFinished] = useState<boolean>(false)

    const [showWriteReviewContent, setShowWriteReviewContent] = useState<boolean>(false)

    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION)

    

    // stores all important information about the review images going to be ADDED
    const [newReviewImages, setNewReviewImages] = useState<{file: File, url: string, uuid: string}[]>([])

    const [existingReviewImages, setExistingReviewImages] = useState<{signedId: string, url: string}[]>([])

    useEffect(() => {
        if (userReviewData !== undefined) setUserReview(userReviewData.obtainUserReview ?? null)
    }, [userReviewData])

    useEffect(() => {
        if (!userReviewError) return
        if (handleMutationUnauth(userReviewError, setUser, navigate)) return
        if (userReviewError.message === "Review not found") navigate("/*")
    }, [userReviewError])

    useEffect(() => {
        if (userReview) {
            setReviewContent(userReview.content || "")
            setRating(userReview.rating || 0)
            setIfFavorite(userReview.ifFavorite)
            setIfFinished(userReview.ifFinished)
            setExistingReviewImages(userReview.imageDetails || [])
        } else {
            setUserReview(null)
            setReviewContent("")
            setRating(0)
            setIfFavorite(false)
            setIfFinished(false)
            setExistingReviewImages([])
        }
    }, [userReview])

    const [createReview] = useMutation<CreateReviewResponse, CreateReviewInput>(CREATE_REVIEW_MUTATION)

    function createReviewFunctionWrapper({newReviewImages = [], newIfFavorite = ifFavorite, newIfFinished = ifFinished, newReviewContent = reviewContent, newRating = rating}: {newReviewImages?: {file: File, url: string, uuid: string}[], newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) {
        createReviewFunction(uploadImageToS3, newReviewImages, newReviewContent, newRating, newIfFavorite, newIfFinished, userReview, setUserReview, mediaId, createReview, setUser, navigate, onReviewChanged)
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
                    userReviewId={userReview?.id || null}
                    reviewContent={reviewContent}
                    title={title}
                    coverImage={coverImage}
                    creator={creator}
                    year={year}
                    setShowWriteReviewContent={setShowWriteReviewContent}
                    createReviewFunctionWrapper={createReviewFunctionWrapper}
                    newReviewImages={newReviewImages}
                    setNewReviewImages={setNewReviewImages}
                    existingReviewImages={existingReviewImages}
                    setExistingReviewImages={setExistingReviewImages}
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

type WriteReviewModalProps = {
    userReviewId: number | null
    reviewContent: string
    title: string
    coverImage: string
    creator: string
    year: number
    setShowWriteReviewContent: (showWriteReviewContent: boolean) => void
    createReviewFunctionWrapper: (params: {newReviewImages?: {file: File, url: string, uuid: string}[], newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void
    newReviewImages: {file: File, url: string, uuid: string}[]
    setNewReviewImages: React.Dispatch<React.SetStateAction<{file: File, url: string, uuid: string}[]>>
    existingReviewImages: {signedId: string, url: string}[]
    setExistingReviewImages: React.Dispatch<React.SetStateAction<{signedId: string, url: string}[]>>
}
function WriteReviewModal({userReviewId, reviewContent, title, coverImage, creator, year, setShowWriteReviewContent, createReviewFunctionWrapper, newReviewImages, setNewReviewImages, existingReviewImages, setExistingReviewImages}: WriteReviewModalProps) {
    const [content, setContent] = useState<string>(reviewContent)
    const remaining = 1000 - content.length

    const fileInputRef = useRef<HTMLInputElement>(null)
    const submit = () => {
        if (content.length > 1000) return
        createReviewFunctionWrapper({newReviewContent: content.trim(), newReviewImages: newReviewImages, newIfFinished: true})
        setShowWriteReviewContent(false)
        setNewReviewImages([])
    }

    const [removeAttachedImage] = useMutation<RemoveAttachedImageResponse, RemoveAttachedImageInput>(REMOVE_ATTACHED_IMAGE_MUTATION)

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

                <div
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg focus-within:border-violet-500/50 transition-colors"
                    onPaste={(e) => handleAttachImages({files: Array.from(e.clipboardData.files || []), newImages: newReviewImages, setNewImages: setNewReviewImages})}
                >
                    <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts…"
                        className="w-full min-h-48 bg-transparent p-4 text-white placeholder-gray-500 focus:outline-none resize-y transition-colors"
                    />
                    {(newReviewImages.length > 0 || existingReviewImages.length > 0) && (
                        <div className="border-t border-white/5 px-4 py-3">
                            <PreviewImageDisplay newImages={newReviewImages} setNewImages={setNewReviewImages} existingImages={existingReviewImages} setExistingImages={setExistingReviewImages} resourceId={userReviewId || null} resourceType="review" />
                        </div>
                    )}
                </div>

                <input ref={fileInputRef} type="file" multiple onChange={(e) => handleAttachImages({files: Array.from(e.target.files || []), newImages: newReviewImages, setNewImages: setNewReviewImages})} accept="image/*" className="hidden" />

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className={"text-xs " + (remaining < 0 ? "text-red-400" : remaining < 100 ? "text-amber-400" : "text-gray-500")}>
                            {remaining} characters left
                        </span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={newReviewImages.length >= 5}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Upload images"
                        >
                            <ImageIcon />
                        </button>
                    </div>
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
                            reviewContent && userReviewId &&
                            <button
                                onClick={() => {
                                    createReviewFunctionWrapper({newReviewContent: ""})
                                    if (existingReviewImages.length > 0) {
                                        removeAttachedImageFunction(removeAttachedImage, existingReviewImages.map((img) => img.signedId), userReviewId, "review")
                                    }
                                    setExistingReviewImages([])
                                    setNewReviewImages([])
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

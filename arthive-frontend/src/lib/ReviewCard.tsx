import { useNavigate } from "react-router-dom"
import DisplayRating from "./DisplayRating"
import { useMutation } from "@apollo/client/react"
import { LIKE_REVIEW_MUTATION, type LikeReviewInput, type LikeReviewResponse } from "../types/mutations/like_review_mutation"
import { useState } from "react"
import type { User } from "../types/user_types"
import { likeReviewFunction } from "../data/like_review"

// for community threads referencing reviews only
export function ReviewReferenceCard({review}: {review: any}) {
    const navigate = useNavigate()
    const hasContent = !!review?.content
    return (
        <button
            onClick={() => hasContent && navigate(`/review_info/${review.id}`)}
            disabled={!hasContent}
            className={`w-full text-left border rounded-xl p-4 transition-all duration-200 flex gap-3 items-start group mx-auto ${hasContent ? "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-violet-500/30 cursor-pointer" : "bg-white/[0.02] border-white/5 cursor-default opacity-60"}`}
        >
            {review?.media?.coverImage && (
                <img 
                    src={review.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                    alt={review.media.title}
                    className="w-10 h-auto rounded-md object-cover flex-shrink-0"
                />
            )}

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced Review</span>
                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View →</span>
                </div>

                {review?.media?.title && (
                    <p className="text-xs text-gray-400 truncate">{review.media.title}</p>
                )}

                <div className="flex items-center gap-2">
                    {review?.user?.profilePicture !== undefined && (
                        <img
                            src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt="Profile"
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                    )}
                    {review?.user?.username && (
                        <span className="text-xs font-medium text-white">{review.user.username}</span>
                    )}
                    {review?.rating != null && (
                        <span className="scale-75 origin-left"><DisplayRating rating={review.rating} /></span>
                    )}
                </div>

                {review?.content && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{review.content}</p>
                )}

                <div className="flex items-center gap-4 text-gray-500 text-xs mt-0.5">
                    <span>🤍 {review.likeCount}</span>
                    <span>💬 {review.commentCount}</span>
                </div>
            </div>
        </button>
    )
}

export default function ReviewCard({review, setUser}: {review: any, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()

    const [currLiked, setCurrLiked] = useState<boolean>(review.ifLiked)
    const [likeCount, setLikeCount] = useState<number>(review.likeCount)

    const [likeReview, {loading}] = useMutation<LikeReviewResponse, LikeReviewInput>(LIKE_REVIEW_MUTATION)

    return (
        <article key={review.id} className="border-b border-white/5 py-4 first:pt-0 last:border-b-0">
            {review?.media?.title ? (
                <h2 className="text-sm text-gray-400 mb-2">{review.media.title}</h2>
            ) : null}

            {review?.media?.id ? (
                <img
                    onClick={() => navigate(`/media/${review.media.id}`)}
                    width={50}
                    height={50}
                    src={review.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                    alt="Cover Image"
                    className="rounded mb-2 cursor-pointer"
                />
            ) : null}

            <div className="flex items-center gap-3 mb-2">
                {review?.user?.id ? (
                    <img
                        width={40}
                        height={40}
                        src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt="Profile Picture"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                ) : null}
                <div className="flex flex-col">
                    {review?.user?.username ? (
                        <span className="font-semibold text-white text-sm">{review.user.username}</span>
                    ) : null}
                    {review?.rating !== null ? <DisplayRating rating={review.rating} /> : null}
                </div>
            </div>

            {review?.content !== null && review?.content !== "" ? (
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.content}</p>
            ) : null}

            {review?.imageDetails?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {review.imageDetails.map((img: {signedId: string, url: string}) => (
                        <img
                            key={img.signedId}
                            src={img.url}
                            alt="Review image"
                            className="h-32 w-auto rounded-lg object-cover"
                        />
                    ))}
                </div>
            )}

            {review.content && (
                <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <button
                        onClick={() => navigate(`/review_info/${review.id}`)}
                        className="hover:text-white transition flex items-center gap-1"
                    >
                        <span>💬</span>
                        <span>{review.commentCount}</span>
                    </button>
                    <button
                        onClick={() => likeReviewFunction(setCurrLiked, likeReview, review.id, setUser, navigate, setLikeCount)}
                        className="hover:text-white transition flex items-center gap-1"
                    >
                        <span>{loading ? "…" : currLiked ? "❤️" : "🤍"}</span>
                        <span>{likeCount}</span>
                    </button>
                </div>
            )}
        </article>
    )
}

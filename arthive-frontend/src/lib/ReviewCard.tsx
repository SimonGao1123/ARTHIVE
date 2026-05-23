import { useNavigate } from "react-router-dom"
import DisplayRating from "./DisplayRating"
import { useMutation } from "@apollo/client/react"
import { LIKE_REVIEW_MUTATION, type LikeReviewInput, type LikeReviewResponse } from "../types/mutations/like_review_mutation"
import { useState } from "react"
import type { User } from "../types/user_types"
import { likeReviewFunction } from "../data/like_review"

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

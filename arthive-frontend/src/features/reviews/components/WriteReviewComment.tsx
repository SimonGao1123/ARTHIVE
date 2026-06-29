import { writeReviewCommentFunction } from "@/data/reviews/writeReviewComment"
import type { ReviewComment } from "@/types/domain/comment"
import type { User } from "@/types/domain/user"
import type { WriteCommentInput, WriteCommentResponse } from "@/types/mutations/review_mutations_types"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { WRITE_COMMENT_MUTATION } from "@/apollo/mutations/review_mutations"
export default function WriteReviewComment({reviewId, setReviewComments, setCommentCount, setUser, navigate, onClose, onCreated}: {
    reviewId: string
    setReviewComments: Dispatch<SetStateAction<ReviewComment[]>>
    setCommentCount: Dispatch<SetStateAction<number>>
    setUser: (user: User | null) => void
    navigate: any
    onClose: () => void
    onCreated?: () => void
}) {
    const [comment, setComment] = useState("")
    const [writeComment, {loading, error}] = useMutation<WriteCommentResponse, WriteCommentInput>(WRITE_COMMENT_MUTATION)

    function handleSubmit() {
        if (!comment.trim()) return
        writeReviewCommentFunction(reviewId, comment, writeComment, setUser, navigate, setReviewComments, setCommentCount, onCreated)
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onClick={onClose}
        >
            {loading && (
                <div className="text-gray-400 text-sm">Writing comment…</div>
            )}
            {error && (
                <div className="text-red-500 text-sm">{error.message}</div>
            )}
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Write a comment</p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <textarea
                    autoFocus
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    rows={4}
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-y transition-colors"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!comment.trim()}
                        className="bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm transition"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}

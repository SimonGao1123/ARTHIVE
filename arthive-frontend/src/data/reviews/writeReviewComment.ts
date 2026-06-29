import type { Dispatch, SetStateAction } from "react"
import type { ReviewComment } from "@/types/domain/comment"
import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

export function writeReviewCommentFunction(
    reviewId: string,
    comment: string,
    writeComment: any,
    setUser: (user: User | null) => void,
    navigate: any,
    setReviewComments: Dispatch<SetStateAction<ReviewComment[]>>,
    setCommentCount: Dispatch<SetStateAction<number>>,
    onCreated?: () => void
) {
    if (comment.trim() === "") {
        alert("Comment cannot be empty")
        return
    }
    writeComment({ variables: { input: { reviewId: parseInt(reviewId), comment } } })
    .then((data: any) => {
        const created = data.data.commentOnReview
        if (created) {
            setReviewComments((prev) => [created, ...prev])
            onCreated?.()
        }
        setCommentCount(prev => prev + 1)
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}
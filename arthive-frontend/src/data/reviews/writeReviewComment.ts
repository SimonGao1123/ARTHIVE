import type { Dispatch, SetStateAction } from "react"
import type { ReviewComment } from "@/types/domain/comment"
import type { User } from "@/types/domain/user"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
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
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
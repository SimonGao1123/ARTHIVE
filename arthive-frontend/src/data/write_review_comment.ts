import type { Dispatch, SetStateAction } from "react"
import type { ReviewComment } from "../types/comment_type"
import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function writeReviewCommentFunction(
    reviewId: string,
    comment: string,
    writeComment: any,
    setUser: (user: User | null) => void,
    navigate: any,
    setReviewComments: Dispatch<SetStateAction<ReviewComment[]>>,
    setCommentCount: Dispatch<SetStateAction<number>>
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
        }
        setCommentCount(prev => prev + 1)
    })
    .catch((error: any) => {
        console.log("error in writeReviewComment", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
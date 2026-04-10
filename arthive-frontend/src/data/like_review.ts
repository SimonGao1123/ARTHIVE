import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function likeReviewFunction(setCurrLiked: (currLiked: boolean) => void, likeReview: any, reviewId: number, setUser: (user: User | null) => void, navigate: any, setLikeCount: (likeCount: number) => void) {
    likeReview({
        variables: {
            input: {
                reviewId: reviewId
            }
        }
    }).then((res: any) => {
        const data = res.data.likeReview
        setCurrLiked(data)
        if (data) {
            setLikeCount((prev: any) => Number(prev) + 1)
        } else {
            setLikeCount((prev: any) => Number(prev) - 1)
        }
    }).catch((err: any) => {
        if (unauth_messages.includes(err.message)) {
            logout(setUser, navigate)
        } else {
            console.log("error in likeReview", err.message)
        }
    })
}

import type { UserReview } from "../types/review_type";
import { logout } from "./logout";
import type { User } from "../types/user_types";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function createReviewFunction(
    reviewContent: string,
    rating: number,
    ifFavorite: boolean,
    ifFinished: boolean,
    userReview: UserReview | null,
    setUserReview: (userReview: UserReview | null) => void,
    mediaId: number,
    createReview: any,
    setUser: (user: User | null) => void,
    navigate: any
) {
    console.log("reviewContent in createReview", reviewContent)
    createReview({ variables: { input: { mediaId, content: reviewContent === "" ? null : reviewContent, rating: rating === 0 ? null : rating, ifFavorite, ifFinished, reviewId: userReview ? userReview.id : null } } })
    .then((data: any) => {
        setUserReview(data.data.createReview)
    })
    .catch((error: any) => {
        console.log("error in createReview", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
    })
}
import type { Review } from "../types/review_type"
import { logout } from "./logout"
import type { Dispatch, SetStateAction } from "react"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainMediaReviewsFunction(
    mediaId: number,
    pageNum: number,
    limit: number,
    obtainMediaReviews: any,
    setReviews: Dispatch<SetStateAction<Review[]>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>
) {
    obtainMediaReviews({ variables: { mediaId, pageNum, limit } })
        .then((data: any) => {
            const batch = data.data.obtainMediaReviews
            if (batch.length < limit) {
                setIfNextPage(false)
            } else if (pageNum === 1) {
                setIfNextPage(true)
            }
            setReviews((prev) => (pageNum === 1 ? batch : [...prev, ...batch]))
        })
        .catch((error: any) => {
            console.log("error in obtainMediaReviews", error.message)
            if (unauth_messages.includes(error.message)) {
                logout(setUser, navigate)
            }
        })
}

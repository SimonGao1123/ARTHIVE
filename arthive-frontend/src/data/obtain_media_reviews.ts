import type { Review } from "../types/review_type"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainMediaReviewsFunction(
    mediaId: number, 
    pageNum: number, 
    limit: number, 
    obtainMediaReviews: any, 
    setReviews: (reviews: Review[]) => void,
    navigate: any,
    setUser: any,
    reviews: Review[],
    setIfNextPage: (ifNextPage: boolean) => void) {
    obtainMediaReviews({ variables: { mediaId, pageNum, limit } })
    .then((data: any) => {
        if (data.data.obtainMediaReviews.length < limit) {
            setIfNextPage(false)
        }
        setReviews([...reviews, ...data.data.obtainMediaReviews])
    })
    .catch((error: any) => {
        console.log("error in obtainMediaReviews", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
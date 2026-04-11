import type { MainReview, ReviewComment, ReviewPage } from "../types/review_type";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainReviewPageFunction(
    reviewId: string,
    pageNum: number, 
    limit: number, 
    setUser: (user: User | null) => void, 
    navigate: any, 
    obtainReviewPage: any, 
    setMainReview: (mainReview: MainReview | null) => void,
    setReviewComments: (reviewComments: ReviewComment[]) => void,
    setIfNextPage: (ifNextPage: boolean) => void
) {
    obtainReviewPage({
        variables: {
            reviewId,
            pageNum,
            limit,
        }
    })
    .then((data: any) => {
        const batch = data.data.obtainReviewPage.reviewComments
        if (batch.length < limit) {
            setIfNextPage(false)
        } else if (pageNum === 1) {
            setIfNextPage(true)
        }
        setReviewComments((prev) => (pageNum === 1 ? batch : [...prev, ...batch]))
        setMainReview(data.data.obtainReviewPage.review)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }

        console.error(error)
    })
}
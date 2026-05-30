import type React from "react";
import type { MainReview, ReviewComment } from "../types/review_type";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainReviewPageFunction(
    reviewId: string,
    query: string,
    cursor: string | null,
    setCursor: React.Dispatch<React.SetStateAction<string | null>>,
    limit: number, 
    setUser: (user: User | null) => void, 
    navigate: any, 
    obtainReviewPage: any, 
    setMainReview: (mainReview: MainReview | null) => void,
    setReviewComments: React.Dispatch<React.SetStateAction<ReviewComment[]>>,
    setIfNextPage: (ifNextPage: boolean) => void
) {
    obtainReviewPage({
        variables: {
            reviewId,
            query,
            after: cursor,
            first: limit
        }
    })
    .then((data: any) => {
        const batch = data.data.obtainReviewPage.reviewComments.edges.map((edge: any) => edge.node)
        setReviewComments((prev) => {
            const existingIds = new Set(prev.map((r) => r.id))
            return [...prev, ...batch.filter((r: any) => !existingIds.has(r.id))]
        })
        setMainReview(data.data.obtainReviewPage.review)
        setIfNextPage(data.data.obtainReviewPage.reviewComments.pageInfo.hasNextPage)
        setCursor(data.data.obtainReviewPage.reviewComments.pageInfo.endCursor)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
import type { Review } from "../types/review_type"
import { logout } from "./logout"
import type { Dispatch, SetStateAction } from "react"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainMediaReviewsFunction(
    mediaId: number,
    cursor: string | null,
    setCursor: Dispatch<SetStateAction<string | null>>,
    limit: number,
    query: string,
    obtainMediaReviews: any,
    setReviews: Dispatch<SetStateAction<Review[]>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>
) {
    obtainMediaReviews({ variables: {
        mediaId: mediaId,
        query: query,
        first: limit,
        after: cursor,
     } })
        .then((data: any) => {
            const batch = data.data.obtainMediaReviews.edges.map((edge: any) => edge.node)
            setReviews((prev) => [...prev, ...batch])
            setCursor(data.data.obtainMediaReviews.pageInfo.endCursor)
            setIfNextPage(data.data.obtainMediaReviews.pageInfo.hasNextPage)
        })
        .catch((error: any) => {
            console.log("error in obtainMediaReviews", error.message)
            if (unauth_messages.includes(error.message)) {
                logout(setUser, navigate)
            }
        })
}

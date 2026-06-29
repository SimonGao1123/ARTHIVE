import type { ReviewsMediaSortEnum } from "@/types/queries/review_queries_types"
import type { Review } from "@/types/domain/review"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { Dispatch, SetStateAction } from "react"

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
    setIfNextPage: Dispatch<SetStateAction<boolean>>,
    sortBy: ReviewsMediaSortEnum
) {
    obtainMediaReviews({ variables: {
        mediaId: mediaId,
        query: query,
        first: limit,
        after: cursor,
        sortBy: sortBy
     } })
        .then((data: any) => {
            const batch = data.data.obtainMediaReviews.edges.map((edge: any) => edge.node)
            setReviews((prev) => {
                const existingIds = new Set(prev.map((r) => r.id))
                return [...prev, ...batch.filter((r: any) => !existingIds.has(r.id))]
            })
            setCursor(data.data.obtainMediaReviews.pageInfo.endCursor)
            setIfNextPage(data.data.obtainMediaReviews.pageInfo.hasNextPage)
        })
        .catch((error: any) => {
            handleMutationUnauth(error, setUser, navigate)
        })
}

import type { Dispatch, SetStateAction } from "react"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

export function obtainRecentUserActivityFunction(
    userId: string,
    setRecentUserActivity: any,
    setUser: any,
    navigate: any,
    obtainRecentUserActivity: any,
    cursor: string | null,
    setCursor: Dispatch<SetStateAction<string | null>>,
    limit: number,
    setHasNextPage: Dispatch<SetStateAction<boolean>>,
) {
    obtainRecentUserActivity({
        variables: {
            userId: userId,
            after: cursor,
            first: limit
        }
    })
    .then((data: any) => {
        const batch = data.data.recentUserActivity.edges.map((edge: any) => edge.node)
        setCursor(data.data.recentUserActivity.pageInfo.endCursor)
        setHasNextPage(data.data.recentUserActivity.pageInfo.hasNextPage)
        setRecentUserActivity((prev: any) => {
            const existingKeys = new Set(prev.map((r: any) => `${r.id}-${r.subject?.__typename}`))
            return [...prev, ...batch.filter((r: any) => !existingKeys.has(`${r.id}-${r.subject?.__typename}`))]
        })
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}

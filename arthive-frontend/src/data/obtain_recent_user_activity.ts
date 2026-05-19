import type { Dispatch, SetStateAction } from "react"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
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
    console.log("userId", userId)
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
            const existingIds = new Set(prev.map((r: any) => r.id))
            return [...prev, ...batch.filter((r: any) => !existingIds.has(r.id))]
        })
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
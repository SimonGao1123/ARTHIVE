import type { Dispatch, SetStateAction } from "react"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { FollowData } from "@/types/queries/follow_queries_types"

export function obtainFollowsDetailsFunction(
    userId: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    query: string,
    limit: number,
    type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows",
    obtainFollowersQuery: any,
    setFollowsData: Dispatch<SetStateAction<FollowData[]>>,
    setUserData: Dispatch<SetStateAction<{id: string, username: string, profilePicture: string} | null>>,
    setCount: Dispatch<SetStateAction<number>>,
    navigate: any,
    setUser: any,
    pageNum: number,
) {
    obtainFollowersQuery({
        variables: {
            userId: userId,
            pageNum: pageNum,
            limit: limit,
            type: type,
            query: query,
        },
    }).then((res: any) => {
        const batch = res.data.obtainFollowerInfo
        setFollowsData(batch.follows)
        setUserData(batch.user)
        setCount(batch.count)
        setTotalPages(batch.pageInfo.totalPages)
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}

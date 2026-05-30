import type { Dispatch, SetStateAction } from "react"
import { logout } from "./logout"
import type { FollowData } from "../types/queries/obtain_followers_query"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

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
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}

import type { Dispatch, SetStateAction } from "react"
import { logout } from "./logout"
import type { FollowData } from "../types/queries/obtain_followers_query"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainFollowsDetailsFunction(
    userId: string,
    pageNum: number,
    limit: number,
    type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows",
    obtainFollowersQuery: any,
    setFollowsData: Dispatch<SetStateAction<FollowData[]>>,
    setUserData: Dispatch<SetStateAction<{id: string, username: string, profilePicture: string} | null>>,
    setCount: Dispatch<SetStateAction<number>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>,
) {
    obtainFollowersQuery({
        variables: {
            userId: userId,
            pageNum: pageNum,
            limit: limit,
            type: type,
        },
    }).then((res: any) => {
        const batch = res.data.obtainFollowerInfo.follows
        if (batch.length < limit) {
            setIfNextPage(false)
        } else if (pageNum === 1) {
            setIfNextPage(true)
        }
        setFollowsData((prev) => (pageNum === 1 ? batch : [...prev, ...batch]))
        setUserData(res.data.obtainFollowerInfo.user)
        setCount(res.data.obtainFollowerInfo.count)
    })
    .catch((error: any) => {
        console.log("error in obtainFollowsDetailsFunction", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}

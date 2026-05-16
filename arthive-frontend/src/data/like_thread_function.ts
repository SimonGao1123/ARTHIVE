import { logout } from "./logout"
import type { User } from "../types/user_types"
import type { Dispatch, SetStateAction } from "react"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function likeThreadFunction(
    setCurrLiked: (currLiked: boolean) => void, 
    likeThread: any, 
    threadId: string, 
    setUser: (user: User | null) => void, 
    navigate: any, 
    setLikeCount: Dispatch<SetStateAction<number>>
) {
    likeThread({
        variables: {
            input: {
                threadId: threadId
            }
        }
    }).then((res: any) => {
        const data = res.data.likeThread
        setCurrLiked(data)
        if (data) {
            setLikeCount((prev: number) => prev + 1)
        } else {
            setLikeCount((prev: number) => prev - 1)
        }
    }).catch((err: any) => {
        if (unauth_messages.includes(err.message)) {
            logout(setUser, navigate)
        } else {
        }
    })
}
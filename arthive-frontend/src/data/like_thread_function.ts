import { logout } from "./logout"
import type { User } from "../types/user_types"
import type { Dispatch, SetStateAction } from "react"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function likeThreadFunction(
    setCurrLiked: Dispatch<SetStateAction<boolean>>,
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
        const serverLiked: boolean = res.data.likeThread
        setCurrLiked(serverLiked)
        setLikeCount((prev: number) => serverLiked ? prev + 1 : prev - 1)
    }).catch((err: any) => {
        setCurrLiked(prev => !prev)
        setLikeCount((prev: number) => prev)
        if (unauth_messages.includes(err.message)) {
            logout(setUser, navigate)
        }
    })
}
import { logout } from "@/data/auth/logout"
import type { User } from "@/types/domain/user"
import type { Dispatch, SetStateAction } from "react"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function likeListFunction(
    setCurrLiked: Dispatch<SetStateAction<boolean>>,
    likeList: any,
    listId: string,
    setUser: (user: User | null) => void,
    navigate: any,
    setLikeCount: Dispatch<SetStateAction<number>>
) {
    likeList({
        variables: {
            input: {
                listId: listId
            }
        }
    }).then((res: any) => {
        const serverLiked: boolean = res.data.likeList
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

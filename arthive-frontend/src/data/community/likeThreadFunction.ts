import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import type { Dispatch, SetStateAction } from "react"

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
        handleMutationUnauth(err, setUser, navigate)
    })
}
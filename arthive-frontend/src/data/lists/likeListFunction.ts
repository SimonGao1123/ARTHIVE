import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import type { Dispatch, SetStateAction } from "react"

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
        handleMutationUnauth(err, setUser, navigate)
    })
}

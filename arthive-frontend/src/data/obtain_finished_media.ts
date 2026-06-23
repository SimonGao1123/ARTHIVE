import type { Dispatch, SetStateAction } from "react"
import type { Media } from "../types/media_type"
import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainFinishedMediaFunction(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    query: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    obtainFinishedMedia: any,
    setMedia: Dispatch<SetStateAction<Media[]>>,
    navigate: any,
    setUser: (user: User | null) => void,
    setPageUser?: Dispatch<SetStateAction<{ id: string; username: string } | null>>
) {
    obtainFinishedMedia({
        variables: {
            userId: user_id,
            contentType: contentType,
            pageNum: pageNum,
            limit: limit,
            query: query === "" ? null : query,
        },
    }).then((res: any) => {
        const batch = res.data.obtainFinishedMedia
        setMedia(batch.media)
        setTotalPages(batch.pageInfo.totalPages)
        setPageUser?.(batch.user)
    }).catch((err: any) => {
        if (unauth_messages.includes(err.message)) {
            logout(setUser, navigate)
        }
    })
}

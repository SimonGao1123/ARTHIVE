import type { Dispatch, SetStateAction } from "react"
import type { LikedOrFinishedMediaCard } from "../types/queries/liked_or_finished_media_query"
import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainLikedOrFinishedMediaFunction(
    user_id: string,
    type: "liked" | "finished",
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    query: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    obtainLikedOrFinishedMedia: any,
    setMedia: Dispatch<SetStateAction<LikedOrFinishedMediaCard[]>>,
    navigate: any,
    setUser: (user: User | null) => void,
    setPageUser?: Dispatch<SetStateAction<{ id: string; username: string } | null>>) {

        obtainLikedOrFinishedMedia({
            variables: {
                userId: user_id,
                type: type,
                contentType: contentType,
                pageNum: pageNum,
                limit: limit,
                query: query === "" ? null : query,
            },
        }).then((res: any) => {
            const batch = res.data.obtainLikedOrFinishedMedia
            setMedia(batch.media)
            setTotalPages(batch.pageInfo.totalPages)
            setPageUser?.(batch.user)
        }).catch((err: any) => {
            if (unauth_messages.includes(err.message)) {
                logout(setUser, navigate)
            }
        })
    }

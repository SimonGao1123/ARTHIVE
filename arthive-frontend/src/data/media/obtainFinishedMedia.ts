import type { Dispatch, SetStateAction } from "react"
import type { Media } from "@/types/domain/media"
import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

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
        handleMutationUnauth(err, setUser, navigate)
    })
}

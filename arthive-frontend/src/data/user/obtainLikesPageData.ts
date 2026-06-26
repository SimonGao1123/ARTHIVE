import type { Dispatch, SetStateAction } from "react"
import type { Media } from "@/types/domain/media"
import type { User } from "@/types/domain/user"
import type { AllUserListType } from "@/types/queries/list_queries_types"
import type { LikedReview, LikesType } from "@/types/queries/shared_queries_types"
import { handleReadUnauth } from "@/data/auth/handleReadUnauth"

export function obtainLikesPageData(
    user_id: string,
    type: LikesType,
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    query: string,
    obtainLikesPage: any,
    setMedia: Dispatch<SetStateAction<Media[]>>,
    setReviews: Dispatch<SetStateAction<LikedReview[]>>,
    setLists: Dispatch<SetStateAction<AllUserListType[]>>,
    setTotalPages: Dispatch<SetStateAction<number>>,
    setPageUser: Dispatch<SetStateAction<{ id: string, username: string } | null>>,
    _navigate: any,
    setUser: (user: User | null) => void,
) {
    obtainLikesPage({
        variables: {
            userId: user_id,
            type: type,
            contentType: contentType,
            pageNum: pageNum,
            limit: limit,
            query: query === "" ? null : query,
        },
    }).then((res: any) => {
        const batch = res.data.obtainLikesPage
        setPageUser(batch.user)
        setTotalPages(batch.pageInfo.totalPages)
        if (type === "media") setMedia(batch.media ?? [])
        else if (type === "reviews") setReviews(batch.reviews ?? [])
        else if (type === "lists") setLists(batch.lists ?? [])
    }).catch((err: any) => {
        handleReadUnauth(err, setUser)
    })
}

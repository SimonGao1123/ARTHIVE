import type { Dispatch, SetStateAction } from "react"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import type { MediaCardData, ContentTypeWithAll } from "@/types/common"

export type BecauseOfReviewsSource = {
    id: number
    title: string
    contentType: string
}

export function becauseOfReviewsExplorePageData(
    navigate: any,
    setUser: (user: User | null) => void,
    currContentType: ContentTypeWithAll,
    limit: number,
    setNextCursor: (cursor: string | null) => void,
    setPrevCursor: (cursor: string | null) => void,
    cursor: string | null,
    goNext: boolean,
    setIfPrevPage: (ifPrevPage: boolean) => void,
    setIfNextPage: (ifNextPage: boolean) => void,
    setAllMedia: Dispatch<SetStateAction<MediaCardData[]>>,
    setSource: (source: BecauseOfReviewsSource | null) => void,
    getBecauseOfReviewsExploreMedia: any
) {
    getBecauseOfReviewsExploreMedia({
        variables: goNext
            ? { contentType: currContentType, after: cursor, first: limit }
            : { contentType: currContentType, before: cursor, last: limit },
    })
    .then((data: any) => {
        const payload = data?.data?.becauseOfReviewsExploreMedia
        if (!payload) {
            setSource(null)
            setAllMedia([])
            setIfNextPage(false)
            setIfPrevPage(false)
            setNextCursor(null)
            setPrevCursor(null)
            return
        }
        setSource(payload.source)
        setAllMedia(payload.media.edges.map((e: any) => e.node))
        setIfNextPage(payload.media.pageInfo.hasNextPage)
        setIfPrevPage(payload.media.pageInfo.hasPreviousPage)
        setNextCursor(payload.media.pageInfo.endCursor)
        setPrevCursor(payload.media.pageInfo.startCursor)
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}

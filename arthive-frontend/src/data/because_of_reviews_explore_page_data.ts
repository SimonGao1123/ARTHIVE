import type { Dispatch, SetStateAction } from "react"
import { logout } from "./logout"
import type { User } from "../types/user_types"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export type BecauseOfReviewsSource = {
    id: number
    title: string
    contentType: string
}

type MediaCardRow = {
    id: number
    coverImage: string
    contentType: string
    ifFavorite: boolean
    ifFinished: boolean
    averageRating: number
}

export function becauseOfReviewsExplorePageData(
    navigate: any,
    setUser: (user: User | null) => void,
    currContentType: "book" | "film" | "series" | "game" | "all",
    limit: number,
    setNextCursor: (cursor: string | null) => void,
    setPrevCursor: (cursor: string | null) => void,
    cursor: string | null,
    goNext: boolean,
    setIfPrevPage: (ifPrevPage: boolean) => void,
    setIfNextPage: (ifNextPage: boolean) => void,
    setAllMedia: Dispatch<SetStateAction<MediaCardRow[]>>,
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
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}

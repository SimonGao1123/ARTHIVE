import { handleReadUnauth } from "@/data/auth/handleReadUnauth"
import type { User } from "@/types/domain/user"

export function NewestExplorePageDataFetch(

    _navigate: any,
    setUser: (user: User | null) => void,
    contentType: "book" | "film" | "series" | "game" | "all",
    limit: number,
    setNextCursor: (nextCursor: string | null) => void,
    setPrevCursor: (prevCursor: string | null) => void,
    cursor: string | null,
    go_next_page: boolean,
    setIfPrevPage: (ifPrevPage: boolean) => void,
    setIfNextPage: (ifNextPage: boolean) => void,
    setAllMedia: any,
    getNewestExplorePageMedia: any) {
    getNewestExplorePageMedia({ variables: go_next_page ? {
        contentType,
        first: limit,
        after: cursor
    } : {
        contentType,
        last: limit,
        before: cursor
    } })
    .then((data: any) => {
        setAllMedia(data.data.newestExploreMedia.edges.map((e: any) => e.node) ?? [])
        setNextCursor(data.data.newestExploreMedia.pageInfo.endCursor)
        setPrevCursor(data.data.newestExploreMedia.pageInfo.startCursor)
        setIfPrevPage(data.data.newestExploreMedia.pageInfo.hasPreviousPage ?? false)
        setIfNextPage(data.data.newestExploreMedia.pageInfo.hasNextPage ?? false)
    })
    .catch((error: any) => {
        handleReadUnauth(error, setUser)
    })
}

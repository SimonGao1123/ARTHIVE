import { logout } from "./logout"
import type { User } from "../types/user_types"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function NewestExplorePageDataFetch(

    navigate: any, 
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
        setAllMedia(data.data.newestExplorePageMedia.edges.map((e: any) => e.node) ?? [])
        setNextCursor(data.data.newestExplorePageMedia.pageInfo.endCursor)
        setPrevCursor(data.data.newestExplorePageMedia.pageInfo.startCursor)
        setIfPrevPage(data.data.newestExplorePageMedia.pageInfo.hasPreviousPage ?? false)
        setIfNextPage(data.data.newestExplorePageMedia.pageInfo.hasNextPage ?? false)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
import { logout } from "./logout"
import type { User } from "../types/user_types"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function ExplorePageDataFetch(

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
    getExplorePageMedia: any) {
    getExplorePageMedia({ variables: go_next_page ? { 
        contentType, 
        first: limit, 
        after: cursor
    } : {
        contentType, 
        last: limit, 
        before: cursor
    } })
    .then((data: any) => {
        setAllMedia(data.data.exploreMedia.edges.map((e: any) => e.node) ?? [])
        setNextCursor(data.data.exploreMedia.pageInfo.endCursor)
        setPrevCursor(data.data.exploreMedia.pageInfo.startCursor)
        setIfPrevPage(data.data.exploreMedia.pageInfo.hasPreviousPage ?? false)
        setIfNextPage(data.data.exploreMedia.pageInfo.hasNextPage ?? false)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
import type { ListType } from "../types/queries/lists_request_queries";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function trendingListsExplorePageData(
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
    setAllLists: (lists: ListType[]) => void,
    getTrendingLists: any
) {
    getTrendingLists({
        variables: goNext ? {
            contentType: currContentType,
            after: cursor,
            first: limit
        } : {
            contentType: currContentType,
            before: cursor,
            last: limit
        }
    })
    .then((data: any) => {
        setAllLists(data.data.obtainTrendingLists.edges.map((edge: any) => edge.node))
        setIfNextPage(data.data.obtainTrendingLists.pageInfo.hasNextPage)
        setIfPrevPage(data.data.obtainTrendingLists.pageInfo.hasPreviousPage)
        setNextCursor(data.data.obtainTrendingLists.pageInfo.endCursor)
        setPrevCursor(data.data.obtainTrendingLists.pageInfo.startCursor)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
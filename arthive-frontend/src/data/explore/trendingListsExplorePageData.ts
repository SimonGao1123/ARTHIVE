import type { ListType } from "@/types/queries/list_queries_types";
import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth";

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
        handleMutationUnauth(error, setUser, navigate)
    })
}

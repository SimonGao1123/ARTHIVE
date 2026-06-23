import type { Dispatch, SetStateAction } from "react";
import type { User } from "@/types/domain/user";
import { logout } from "@/data/auth/logout";

// only for a specific type (no all type) and NO FILTERS, just query
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function quickSearchQuery(
    query: string, 
    searchType: string, 
    cursor: string | null, 
    limit: number,
    setUser: (user: User) => void,
    setHasNextPage: (hasNextPage: boolean) => void,
    setCursor: (cursor: string | null) => void,
    setSearchResults: Dispatch<SetStateAction<any[]>>,
    navigate: any,
    obtainQuickSearch: any
) {
    if (searchType != "media" && searchType != "user" && searchType != "review") {
        throw new Error("Invalid search type")
    }
    obtainQuickSearch(
        {
            variables: {
                query: query,
                searchType: searchType,
                after: cursor,
                first: limit
            }
        }
    ).then((data: any) => {
        const batch = data.data.searchBar
        switch (searchType) {
            case "media":
                setSearchResults((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id))
                    return [...prev, ...batch.medias.edges.map((edge: any) => edge.node).filter((m: any) => !existingIds.has(m.id))]
                })
                setCursor(batch.medias.pageInfo.endCursor)
                setHasNextPage(batch.medias.pageInfo.hasNextPage)
                break
            case "user":
                setSearchResults((prev) => {
                    const existingIds = new Set(prev.map((u) => u.id))
                    return [...prev, ...batch.users.edges.map((edge: any) => edge.node).filter((u: any) => !existingIds.has(u.id))]
                })
                setCursor(batch.users.pageInfo.endCursor)
                setHasNextPage(batch.users.pageInfo.hasNextPage)
                break
            case "review":
                setSearchResults((prev) => {
                    const existingIds = new Set(prev.map((r) => r.id))
                    return [...prev, ...batch.reviews.edges.map((edge: any) => edge.node).filter((r: any) => !existingIds.has(r.id))]
                })
                setCursor(batch.reviews.pageInfo.endCursor)
                setHasNextPage(batch.reviews.pageInfo.hasNextPage)
                break
        }
    }).catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(navigate, setUser)
        }
        else {
            alert(error.message)
        }
    })
}
import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
import { logout } from "./logout";

// only for a specific type and NO FILTERS, just query
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
                setSearchResults((prev) => [...prev, ...batch.medias.edges.map((edge: any) => edge.node)])
                setCursor(batch.medias.pageInfo.endCursor)
                setHasNextPage(batch.medias.pageInfo.hasNextPage)
                break
            case "user":
                setSearchResults((prev) => [...prev, ...batch.users.edges.map((edge: any) => edge.node)])
                setCursor(batch.users.pageInfo.endCursor)
                setHasNextPage(batch.users.pageInfo.hasNextPage)
                break
            case "review":
                setSearchResults((prev) => [...prev, ...batch.reviews.edges.map((edge: any) => edge.node)])
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
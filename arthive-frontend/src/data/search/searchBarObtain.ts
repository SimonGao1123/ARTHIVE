import type { Dispatch, SetStateAction } from "react"
import type { User } from "@/types/domain/user"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function searchBarObtain(
    query: string,
    searchType: "all" | "media" | "user" | "review" | "list" | "thread",
    cursors: {
        medias: string | null,
        users: string | null,
        reviews: string | null,
        lists: string | null,
        threads: string | null
    },
    limit: number,
    filter: any,
    setCursors: any,
    setSearchResults: Dispatch<SetStateAction<any[]>>,
    setHasNextPage: Dispatch<SetStateAction<boolean>>,
    setUser: (user: User) => void,
    navigate: any,
    obtainSearchBar: any
) {
    obtainSearchBar({
        variables: {
            query: query,
            searchType: searchType,
            searchFilter: filter,
            after_medias: cursors.medias,
            first_medias: limit,
            after_users: cursors.users,
            first_users: limit,
            after_reviews: cursors.reviews,
            first_reviews: limit,
            after_lists: cursors.lists,
            first_lists: limit,
            after_threads: cursors.threads,
            first_threads: limit
        }
    })
    .then((data: any) => {
        if (query === null ||query === "") {
            alert("Please enter a search query")
            return
        }
        const batch = data.data.searchBar
        
        const newItems = [
            ...batch.medias.edges.map((edge: any) => ({type: "media", ...edge.node})),
            ...batch.users.edges.map((edge: any) => ({type: "user", ...edge.node})),
            ...batch.reviews.edges.map((edge: any) => ({type: "review", ...edge.node})),
            ...batch.lists.edges.map((edge: any) => ({type: "list", ...edge.node})),
            ...batch.threads.edges.map((edge: any) => ({type: "thread", ...edge.node}))
        ]

        setSearchResults((prev) => {
            // prevents duplicates by tracking the type and the id (might have same id for different types)
            const existingIds = new Map(prev.map((item:any) => [`${item.type}-${item.id}`, item]))
            newItems.forEach((item: any) => {
                existingIds.set(`${item.type}-${item.id}`, item)
            })
            return Array.from(existingIds.values())
        })
        
        setCursors(() => {
            return {
                medias: batch.medias.pageInfo.endCursor,
                users: batch.users.pageInfo.endCursor,
                reviews: batch.reviews.pageInfo.endCursor,
                lists: batch.lists.pageInfo.endCursor,
                threads: batch.threads.pageInfo.endCursor
            }
        })
        setHasNextPage(batch.medias.pageInfo.hasNextPage || batch.users.pageInfo.hasNextPage || batch.reviews.pageInfo.hasNextPage || batch.lists.pageInfo.hasNextPage || batch.threads.pageInfo.hasNextPage)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
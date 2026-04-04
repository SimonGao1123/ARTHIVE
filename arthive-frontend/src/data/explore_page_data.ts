import { logout } from "./logout"
import type { User } from "../types/user_types"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function ExplorePageDataFetch(
    navigate: any, 
    setUser: (user: User | null) => void, 
    contentType: "book" | "film" | "series" | "all", 
    limit: number,
    pageNum: number,
    setIfPrevPage: (ifPrevPage: boolean) => void,
    setIfNextPage: (ifNextPage: boolean) => void,
    setAllMedia: any, 
    getExplorePageMedia: any) {
        
    console.log("Fetching data for contentType", contentType, "and limit", limit)
    getExplorePageMedia({ variables: { contentType, limit, pageNum } })
    .then((data: any) => {
        setAllMedia(data.data.exploreMedia.media ?? [])
        setIfPrevPage(data.data.exploreMedia.ifPrevPage ?? false)
        setIfNextPage(data.data.exploreMedia.ifNextPage ?? false)
        console.log("data in ExplorePageDataFetch", data.data.exploreMedia)
    })
    .catch((error: any) => {
        console.log("error in ExplorePageDataFetch", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
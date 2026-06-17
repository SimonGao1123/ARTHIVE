import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function hottestExplorePageData(
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
    setAllMedia: Dispatch<SetStateAction<{id: number, coverImage: string, contentType: string, ifFavorite: boolean, ifFinished: boolean}[]>>,
    getHottestExplorePageMedia: any
) {
    getHottestExplorePageMedia(
        {
            variables: goNext ? {
                contentType: currContentType,
                after: cursor,
                first: limit
            } : {
                contentType: currContentType,
                before: cursor,
                last: limit
            }
        }
    )
    .then((data: any) => {
        const batch = data.data.hottestExploreMedia.edges.map((edge: any) => edge.node)
        setAllMedia(batch)
        setIfNextPage(data.data.hottestExploreMedia.pageInfo.hasNextPage)
        setIfPrevPage(data.data.hottestExploreMedia.pageInfo.hasPreviousPage)
        setNextCursor(data.data.hottestExploreMedia.pageInfo.endCursor)
        setPrevCursor(data.data.hottestExploreMedia.pageInfo.startCursor)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
    }
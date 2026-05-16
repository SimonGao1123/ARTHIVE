import type { User } from "../types/user_types";
import type { Community } from "../types/queries/community_request_queries";
import type { CommunityThread } from "../types/queries/community_request_queries";
import { logout } from "./logout";
import type { Dispatch, SetStateAction } from "react";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainCommunityData(
    mediaId: string,
    first: number,
    after: string | null,
    query: string | null,
    setCommunity: Dispatch<SetStateAction<Community | null>>,
    setRootThreads: Dispatch<SetStateAction<CommunityThread[]>>,
    setCursor: Dispatch<SetStateAction<string | null>>,
    obtainCommunity: any,
    navigate: any,
    setUser: (user: User | null) => void,
    setIfNextPage: Dispatch<SetStateAction<boolean>>
) {
    obtainCommunity({
        variables: {
            mediaId: mediaId,
            first: first,
            after: after,
            query: query,
        }
    })
    .then((data: any) => {
        const community = data.data.obtainCommunity
        const batch = community.rootThreads.edges.map((edge: any) => edge.node)
        setRootThreads((prev) => {
            const existingIds = new Set(prev.map((t) => t.id))
            return [...prev, ...batch.filter((t: any) => !existingIds.has(t.id))]
        })
        setCursor(community.rootThreads.pageInfo.endCursor)
        setIfNextPage(community.rootThreads.pageInfo.hasNextPage)
        setCommunity({id: community.id, media: community.media})

    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
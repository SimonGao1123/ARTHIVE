import type { Dispatch, SetStateAction } from "react"
import type { ArchivrMessage } from "../types/queries/archivr_chat_request_query"
import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function requestArchivrChatFunction(
    mediaId: string,
    cursor: string | null,
    setCursor: Dispatch<SetStateAction<string | null>>,
    limit: number,
    obtainArchivrConversation: any,
    setMessages: Dispatch<SetStateAction<ArchivrMessage[]>>,
    navigate: any,
    setUser: (user: User | null) => void,
    setIfNextPage: Dispatch<SetStateAction<boolean>>,
) {
    obtainArchivrConversation({
        variables: {
            mediaId,
            first: limit,
            after: cursor,
        },
    })
        .then((data: any) => {
            const connection = data.data?.obtainArchivrConversation
            if (!connection) {
                setIfNextPage(false)
                return
            }
            const batchDesc: ArchivrMessage[] = connection.edges.map((edge: any) => edge.node)
            const batchAsc = [...batchDesc].reverse()
            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id))
                const filtered = batchAsc.filter((m) => !existingIds.has(m.id))
                return [...filtered, ...prev]
            })
            setCursor(connection.pageInfo.endCursor)
            setIfNextPage(connection.pageInfo.hasNextPage)
        })
        .catch((error: any) => {
            if (unauth_messages.includes(error.message)) {
                logout(setUser, navigate)
            }
        })
}

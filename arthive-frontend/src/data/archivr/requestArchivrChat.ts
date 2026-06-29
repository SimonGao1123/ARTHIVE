import type { Dispatch, SetStateAction } from "react"
import type { ArchivrMessage } from "@/types/queries/archivr_queries_types"
import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


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
    setRecommendedPrompts: Dispatch<SetStateAction<string[]>>,
) {
    obtainArchivrConversation({
        variables: {
            mediaId,
            first: limit,
            after: cursor,
        },
    })
        .then((data: any) => {
            const payload = data.data?.obtainArchivrConversation
            if (!payload) {
                setIfNextPage(false)
                return
            }
            const connection = payload.messages
            const batchDesc: ArchivrMessage[] = connection.edges.map((edge: any) => edge.node)
            const batchAsc = [...batchDesc].reverse()
            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id))
                const filtered = batchAsc.filter((m) => !existingIds.has(m.id))
                return [...filtered, ...prev]
            })
            setCursor(connection.pageInfo.endCursor)
            setIfNextPage(connection.pageInfo.hasNextPage)
            if (cursor === null) setRecommendedPrompts(payload.recommendedPrompts ?? [])
        })
        .catch((error: any) => {
            handleMutationUnauth(error, setUser, navigate)
            console.error(error)
        })
}

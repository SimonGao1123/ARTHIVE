import type { Dispatch, SetStateAction } from "react"
import type { ArchivrMessage } from "@/types/queries/archivr_queries_types"
import type { User } from "@/types/domain/user"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function sendArchivrMessageFunction(
    messageArchivr: any,
    mediaId: string,
    query: string,
    optimisticId: string,
    setMessages: Dispatch<SetStateAction<ArchivrMessage[]>>,
    setUser: (user: User | null) => void,
    navigate: any,
) {
    return messageArchivr({
        variables: {
            input: {
                mediaId,
                query,
            },
        },
    })
        .then((res: any) => {
            const assistant = res.data?.messageArchivr
            if (!assistant) return
            setMessages((prev) => [...prev, assistant])
        })
        .catch((error: any) => {
            if (unauth_messages.includes(error.message)) {
                logout(setUser, navigate)
                return
            }
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        })
}

import { logout } from "./logout"
import type { User } from "../types/user_types"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function deleteAllListMembersData(
    listId: string,
    navigate: any,
    setUser: (user: User | null) => void,
    deleteAllListMembers: any
) {
    deleteAllListMembers({ variables: { input: { listId } } })
    .then((data: any) => {
        if (data.data.deleteAllListMembers) {
            window.location.reload()
        }
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
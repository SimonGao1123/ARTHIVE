import type { User } from "../types/user_types"
import type { InvitableUser } from "../types/queries/list_invitation_request_queries"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function listInvitationUserSearchFunction(
    listInvitationUserSearch: any,
    query: string,
    listId: string,
    limit: number,
    navigate: any,
    setUser: (user: User | null) => void,
    onResults: (users: InvitableUser[]) => void,
) {
    if (!query.trim()) {
        onResults([])
        return
    }

    listInvitationUserSearch({
        variables: { query, listId, limit }
    })
    .then((res: any) => {
        const results: InvitableUser[] = res?.data?.listInvitationUserSearch ?? []
        onResults(results)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            onResults([])
        }
    })
}

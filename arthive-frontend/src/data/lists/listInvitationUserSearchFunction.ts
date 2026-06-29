import type { User } from "@/types/domain/user"
import type { InvitableUser } from "@/types/queries/user_queries_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


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
        if (!handleMutationUnauth(error, setUser, navigate)) {
            onResults([])
        }
    })
}

import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"


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
        handleMutationUnauth(error, setUser, navigate)
    })
}
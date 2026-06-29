import type { User } from "@/types/domain/user"
import type { ListMemberType } from "@/types/mutations/list_mutations_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


export function inviteUserToListFunction(
    inviteUserToList: any,
    listId: string,
    userId: string,
    role: "member" | "admin",
    navigate: any,
    setUser: (user: User | null) => void,
    onSuccess?: (member: ListMemberType) => void,
    onError?: (msg: string) => void,
) {
    inviteUserToList({
        variables: {
            input: { listId, userId, role }
        }
    })
    .then((res: any) => {
        const member: ListMemberType | undefined = res?.data?.inviteUserToList
        if (member) onSuccess?.(member)
    })
    .catch((error: any) => {
        if (!handleMutationUnauth(error, setUser, navigate)) {
            onError?.(error.message ?? "Failed to send invite")
        }
    })
}

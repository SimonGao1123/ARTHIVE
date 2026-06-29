import type { User } from "@/types/domain/user"
import type { ListMemberType } from "@/types/mutations/list_mutations_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


export function alterListMembershipFunction(
    alterListMembership: any,
    listMemberId: string,
    listId: string,
    action: "remove" | "change_role",
    role: "member" | "admin" | null,
    navigate: any,
    setUser: (user: User | null) => void,
    onSuccess?: (member: ListMemberType) => void,
    onError?: (msg: string) => void,
) {
    alterListMembership({
        variables: {
            input: { listMemberId, listId, action, role }
        }
    })
    .then((res: any) => {
        const member: ListMemberType | undefined = res?.data?.alterListMembership
        if (member) onSuccess?.(member)
    })
    .catch((error: any) => {
        if (!handleMutationUnauth(error, setUser, navigate)) {
            onError?.(error.message ?? "Failed to update membership")
        }
    })
}

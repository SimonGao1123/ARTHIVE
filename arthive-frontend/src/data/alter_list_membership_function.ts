import type { User } from "../types/user_types"
import type { ListMemberType } from "../types/mutations/list_invitation_mutations"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

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
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            onError?.(error.message ?? "Failed to update membership")
        }
    })
}

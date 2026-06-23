import type { User } from "@/types/domain/user"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function respondToListInviteFunction(
    respondToListInvite: any,
    listMemberId: string,
    accept: boolean,
    navigate: any,
    setUser: (user: User | null) => void,
    onStatus: (status: string | null) => void,
) {
    respondToListInvite({
        variables: {
            input: { listMemberId, accept }
        }
    })
    .then((res: any) => {
        const status: string | undefined = res?.data?.respondToListInvite?.status
        onStatus(status ?? null)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            alert(error.message)
        }
    })
}

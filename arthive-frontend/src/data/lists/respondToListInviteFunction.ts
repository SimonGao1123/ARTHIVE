import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


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
        if (!handleMutationUnauth(error, setUser, navigate)) {
            alert(error.message)
        }
    })
}

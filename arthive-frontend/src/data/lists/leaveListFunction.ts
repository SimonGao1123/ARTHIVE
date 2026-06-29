import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth";


export function leaveListFunction(
    listId: string,
    setUser: (user: User) => void,
    navigate: (path: string) => void,
    leaveList: any
) {
    leaveList({variables: {input: {listId}}}).then((res: any) => {
        if (res.data.leaveList) {
            window.location.reload()
        }
    }).catch((err: any) => {
        handleMutationUnauth(err, setUser, navigate)
    })
}
import type { User } from "@/types/domain/user";
import { logout } from "../auth/logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

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
        if (unauth_messages.includes(err.message)) {
            logout(setUser, navigate)
        }
    })
}
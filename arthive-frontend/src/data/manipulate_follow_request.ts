import { logout } from "./logout"
import type { User } from "../types/user_types"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function manipulateFollowRequest(manipulateFollow: any, followId: string, manipulation: string, navigate: any, setFollowStatus: (followStatus: {id: string, status: string} | null) => void, setUser: (user: User) => void) {
    manipulateFollow({variables: {input: {followId: parseInt(followId), manipulation: manipulation}}})
    .then((data: any) => {
        if (data.data.manipulateFollow.status === "rejected") {
            setFollowStatus(null)
        }
        else {
            setFollowStatus({id: followId, status: data.data.manipulateFollow.status})
        }
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(navigate, setUser)
        }
        else {
            alert(error.message)
        }
    })
}
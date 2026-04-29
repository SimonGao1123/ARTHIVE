import type { User } from "../types/user_types";
import { logout } from "./logout"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function sendFollowRequest(sendFollow: any, receiverId: string, navigate: any, setUser: (user: User) => void, setCurrOutgoingFollowStatus: (currOutgoingFollowStatus: {id: string, status: string} | null) => void) {
    sendFollow({variables: {input: {receiverId: parseInt(receiverId)}}})
    .then((data: any) => {
        setCurrOutgoingFollowStatus({id: data.data.sendFollow.id, status: data.data.sendFollow.status})
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
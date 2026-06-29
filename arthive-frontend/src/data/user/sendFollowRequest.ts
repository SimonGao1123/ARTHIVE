import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
export function sendFollowRequest(sendFollow: any, receiverId: string, navigate: any, setUser: (user: User) => void, setCurrOutgoingFollowStatus: (currOutgoingFollowStatus: {id: string, status: string} | null) => void) {
    sendFollow({variables: {input: {receiverId: parseInt(receiverId)}}})
    .then((data: any) => {
        setCurrOutgoingFollowStatus({id: data.data.sendFollow.id, status: data.data.sendFollow.status})
    })
    .catch((error: any) => {
        if (!handleMutationUnauth(error, setUser, navigate)) {
            alert(error.message)
        }
    })
}
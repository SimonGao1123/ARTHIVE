import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
export function manipulateFollowRequest(manipulateFollow: any, followId: string, manipulation: string, navigate: any, setFollowStatus: (followStatus: {id: string, status: string} | null) => void, setUser: (user: User) => void, obtainFollowsDetails?: () => void) {

    manipulateFollow({variables: {input: {followId: parseInt(followId), manipulation: manipulation}}})
    .then((data: any) => {
        if (data.data.manipulateFollow.status === "rejected") {
            setFollowStatus(null)
        }
        else {
            setFollowStatus({id: followId, status: data.data.manipulateFollow.status})
        }
        obtainFollowsDetails?.()
    })
    .catch((error: any) => {
        if (!handleMutationUnauth(error, setUser, navigate)) {
            alert(error.message)
        }
    })
}
import type { User } from "../types/user_types"
import { logout } from "./logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function ObtainUserProfileFetch(
    getUserProfile: any, 
    setUserProfileData: any, 
    userId: string,
    setUser: (user: User | null) => void,
    navigate: any
) {
    getUserProfile({ variables: { userId } })
    .then((data: any) => {
        setUserProfileData(data.data.obtainUserProfile)
        console.log("data in ObtainUserProfileFetch", data.data.obtainUserProfile)
    })
    .catch((error: any) => {
        console.log("error in ObtainUserProfileFetch", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "User not found") {
            navigate(`/*`)
        }
    })
}
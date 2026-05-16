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
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "User not found") {
            navigate(`/*`)
        }
    })
}
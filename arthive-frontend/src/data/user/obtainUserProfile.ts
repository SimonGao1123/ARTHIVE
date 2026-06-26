import type { User } from "@/types/domain/user"
import { handleReadUnauth } from "@/data/auth/handleReadUnauth"

export function ObtainUserProfileFetch(
    getUserProfile: any,
    setUserProfileData: any,
    userId: string,
    setUser: (user: User | null) => void,
    navigate: any,
) {
    getUserProfile({ variables: { userId } })
    .then((data: any) => {
        setUserProfileData(data.data.obtainUserProfile)
    })
    .catch((error: any) => {
        if (handleReadUnauth(error, setUser)) return
        if (error.message === "User not found") {
            navigate(`/*`)
        }
    })
}

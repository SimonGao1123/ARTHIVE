import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

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
        if (handleMutationUnauth(error, setUser, navigate)) return
        if (error.message === "User not found") {
            navigate(`/*`)
        }
    })
}

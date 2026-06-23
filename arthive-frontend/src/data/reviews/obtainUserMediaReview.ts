import { logout } from "@/data/auth/logout"
import type { User } from "@/types/domain/user"
import type { UserReview } from "@/types/domain/review"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainUserMediaReview(setUserReview: (userReview: UserReview | null) => void, getUserMediaReview: any,mediaId: number, navigate: any, setUser: (user: User | null) => void) {
    getUserMediaReview({ variables: { mediaId } })
    .then((data: any) => {
        setUserReview(data.data.obtainUserReview)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "Review not found") {
            navigate("/*")
            
        }
    })
}
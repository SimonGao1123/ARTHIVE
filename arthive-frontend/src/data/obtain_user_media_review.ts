import { logout } from "./logout"
import type { User } from "../types/user_types"
import type { UserReview } from "../types/review_type"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainUserMediaReview(setUserReview: (userReview: UserReview | null) => void, getUserMediaReview: any,mediaId: number, navigate: any, setUser: (user: User | null) => void) {
    getUserMediaReview({ variables: { mediaId } })
    .then((data: any) => {
        setUserReview(data.data.obtainUserReview)
        console.log("data in obtainUserMediaReview", data.data.obtainUserReview)
    })
    .catch((error: any) => {
        console.log("error in obtainUserMediaReview", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "Review not found") {
            navigate("/*")
            
        }
    })
}
import { handleReadUnauth } from "@/data/auth/handleReadUnauth"
import type { User } from "@/types/domain/user"
import type { UserReview } from "@/types/domain/review"

export function obtainUserMediaReview(setUserReview: (userReview: UserReview | null) => void, getUserMediaReview: any, mediaId: number, navigate: any, setUser: (user: User | null) => void) {
    getUserMediaReview({ variables: { mediaId } })
    .then((data: any) => {
        setUserReview(data.data.obtainUserReview)
    })
    .catch((error: any) => {
        if (handleReadUnauth(error, setUser)) return
        if (error.message === "Review not found") {
            navigate("/*")
        }
    })
}

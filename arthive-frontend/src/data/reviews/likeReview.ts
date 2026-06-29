import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


export function likeReviewFunction(setCurrLiked: (currLiked: boolean) => void, likeReview: any, reviewId: number, setUser: (user: User | null) => void, navigate: any, setLikeCount: (updater: number | ((prev: number) => number)) => void) {
    likeReview({
        variables: {
            input: {
                reviewId: reviewId
            }
        }
    }).then((res: any) => {
        const data = res.data.likeReview
        setCurrLiked(data)
        if (data) {
            setLikeCount((prev: any) => Number(prev) + 1)
        } else {
            setLikeCount((prev: any) => Number(prev) - 1)
        }
    }).catch((err: any) => {
        if (!handleMutationUnauth(err, setUser, navigate)) {
            console.error(err)
        }
    })
}
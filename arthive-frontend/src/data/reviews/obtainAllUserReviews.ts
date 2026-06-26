import type { AllReview } from "@/types/domain/review";
import { handleReadUnauth } from "@/data/auth/handleReadUnauth";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@/types/domain/user";

export function obtainAllUserReviewsFunction(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    query: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    obtainAllUserReviews: any,
    setReviews: Dispatch<SetStateAction<AllReview[]>>,
    setTargetUser: Dispatch<SetStateAction<User | null>>,
    _navigate: any,
    setUser: any) {

        obtainAllUserReviews({
            variables: {
                userId: user_id,
                contentType: contentType,
                pageNum: pageNum,
                limit: limit,
                query: query === "" ? null : query,
            },
        }).then((res: any) => {
            const batch = res.data.obtainAllUserReviews
            setReviews(batch.reviews)
            setTotalPages(batch.pageInfo.totalPages)
            setTargetUser(batch.user)

        }).catch((err: any) => {
            handleReadUnauth(err, setUser)
        })
    }

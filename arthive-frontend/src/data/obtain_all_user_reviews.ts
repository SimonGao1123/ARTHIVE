import type { AllReview } from "../types/review_type";
import { logout } from "./logout";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

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
    navigate: any,
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
            if (unauth_messages.includes(err.message)) {
                logout(setUser, navigate)
            }
        })
    }
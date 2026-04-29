import type { AllReview } from "../types/review_type";
import { logout } from "./logout";
import type { Dispatch, SetStateAction } from "react";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainAllUserReviewsFunction(
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    obtainAllUserReviews: any,
    setReviews: Dispatch<SetStateAction<AllReview[]>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>) {

        obtainAllUserReviews({
            variables: {
                contentType: contentType,
                pageNum: pageNum,
                limit: limit,
            },
        }).then((res: any) => {
            const batch = res.data.obtainAllUserReviews
            if (batch.length < limit) {
                setIfNextPage(false)
            } else if (pageNum === 1) {
                setIfNextPage(true)
            }
            setReviews((prevReviews) =>
                pageNum === 1 ? batch : [...prevReviews, ...batch]
            )
        }).catch((err: any) => {
            console.log(err)
            if (unauth_messages.includes(err.message)) {
                logout(setUser, navigate)
            }
        })
    }
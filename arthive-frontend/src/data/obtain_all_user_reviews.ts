import type { AllReview } from "../types/review_type";
import { logout } from "./logout";
import type { Dispatch, SetStateAction } from "react";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainAllUserReviewsFunction(
    contentType: "book" | "film" | "series" | "all",
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
            if (res.data.obtainAllUserReviews.length < limit) {
                setIfNextPage(false)
            }
            setReviews((prevReviews) => [...prevReviews, ...res.data.obtainAllUserReviews])
        }).catch((err: any) => {
            console.log(err)
            if (unauth_messages.includes(err.message)) {
                logout(setUser, navigate)
            }
        })
    }
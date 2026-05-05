import type { AllReview } from "../types/review_type";
import { logout } from "./logout";
import type { Dispatch, SetStateAction } from "react";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainAllUserReviewsFunction(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    obtainAllUserReviews: any,
    setReviews: Dispatch<SetStateAction<{reviews: AllReview[], user: {id: string, username: string}}>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>) {

        obtainAllUserReviews({
            variables: {
                userId: user_id,
                contentType: contentType,
                pageNum: pageNum,
                limit: limit,
            },
        }).then((res: any) => {
            const batch = res.data.obtainAllUserReviews
            if (batch.reviews.length < limit) {
                setIfNextPage(false)
            } else if (pageNum === 1) {
                setIfNextPage(true)
            }
            setReviews((prevReviews) =>
                pageNum === 1 ? { reviews: batch.reviews, user: batch.user } : { reviews: [...prevReviews.reviews, ...batch.reviews], user: prevReviews.user }
            )
        }).catch((err: any) => {
            console.log(err)
            if (unauth_messages.includes(err.message)) {
                logout(setUser, navigate)
            }
        })
    }
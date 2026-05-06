import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
import type { AllUserListType } from "../types/queries/lists_request_queries";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainAllUserListsData(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    pageNum: number,
    limit: number,
    obtainAllUserLists: any,
    setLists: Dispatch<SetStateAction<AllUserListType[]>>,
    setTargetUser: Dispatch<SetStateAction<User | null>>,
    navigate: any,
    setUser: any,
    setIfNextPage: Dispatch<SetStateAction<boolean>>) {
    
    obtainAllUserLists({
        variables: {
            userId: user_id,
            contentType: contentType,
            pageNum: pageNum,
            limit: limit,
        },
    }).then((res: any) => {
        const batch = res.data.obtainAllUserLists
        if (batch.lists.length < limit) {
            setIfNextPage(false)
        } else if (pageNum === 1) {
            setIfNextPage(true)
        }

        setLists((prevLists) =>
            pageNum === 1 ? batch.lists : [...prevLists, ...batch.lists]
        )
        setTargetUser(batch.user)
    }).catch((err: any) => {
        if (unauth_messages.includes(err.message)) {
            logout(navigate, setUser)
            navigate("/login")
            setUser(null)
        }
    })
}
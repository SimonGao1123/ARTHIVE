import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
import type { AllUserListType } from "../types/queries/lists_request_queries";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function obtainAllUserListsData(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    query: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    limit: number,
    obtainAllUserLists: any,
    setLists: Dispatch<SetStateAction<AllUserListType[]>>,
    setTargetUser: Dispatch<SetStateAction<User | null>>,
    navigate: any,
    setUser: any,
    pageNum: number,
    excludeMediaId: string | null,
) {
    
    obtainAllUserLists({
        variables: {
            userId: user_id,
            contentType: contentType,
            pageNum: pageNum,
            limit: limit,
            query: query === "" ? null : query,
            excludeMediaId: excludeMediaId,
        },
    }).then((res: any) => {
        const batch = res.data.obtainAllUserLists
        setLists(batch.lists)
        setTotalPages(batch.pageInfo.totalPages)
        setTargetUser(batch.user)
    }).catch((err: any) => {
        if (unauth_messages.includes(err.message)) {
            logout(navigate, setUser)
            navigate("/login")
            setUser(null)
        }
    })
}
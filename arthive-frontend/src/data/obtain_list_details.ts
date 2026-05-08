import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainListDetails(
    listId: string,
    pageNum: number,
    limit: number,
    query: string | null,
    setUser: (user: User | null) => void,
    setTotalPages: (totalPages: number) => void,
    navigate: any,
    obtainListPage: any,
    setTargetUser: (user: User | null) => void,
    setListData: any,
    setMediaInLists: any,
) {
    obtainListPage({
        variables: {
            listId: listId,
            pageNum: pageNum,
            limit: limit,
            query: query || null,
        }
    }).then((data: any) => {
        const batch = data.data.obtainListPage
        setMediaInLists(batch.mediaInLists.map((mediaInList: any) => mediaInList.media))
        setListData(batch.list)
        setTotalPages(batch.pageInfo.totalPages)
        setTargetUser(batch.user)
    })
    .catch((error: any) => {
        console.log("error in obtainListDetails", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
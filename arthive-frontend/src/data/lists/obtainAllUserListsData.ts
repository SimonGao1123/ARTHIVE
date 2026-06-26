import type { Dispatch, SetStateAction } from "react";
import type { User } from "@/types/domain/user";
import type { AllUserListType, RoleFilter } from "@/types/queries/list_queries_types";
import { handleReadUnauth } from "@/data/auth/handleReadUnauth";

export function obtainAllUserListsData(
    user_id: string,
    contentType: "book" | "film" | "series" | "game" | "all",
    query: string,
    setTotalPages: Dispatch<SetStateAction<number>>,
    limit: number,
    obtainAllUserLists: any,
    setLists: Dispatch<SetStateAction<AllUserListType[]>>,
    setTargetUser: Dispatch<SetStateAction<User | null>>,
    _navigate: any,
    setUser: any,
    pageNum: number,
    excludeMediaId: string | null,
    roleFilter: RoleFilter,
) {

    obtainAllUserLists({
        variables: {
            userId: user_id,
            contentType: contentType,
            pageNum: pageNum,
            limit: limit,
            query: query === "" ? null : query,
            excludeMediaId: excludeMediaId,
            roleFilter: roleFilter,
        },
    }).then((res: any) => {
        const batch = res.data.obtainAllUserLists
        setLists(batch.lists)
        setTotalPages(batch.pageInfo.totalPages)
        setTargetUser(batch.user)
    }).catch((err: any) => {
        handleReadUnauth(err, setUser)
    })
}

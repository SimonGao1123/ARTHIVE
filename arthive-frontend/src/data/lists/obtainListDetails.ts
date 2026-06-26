import type { User } from "@/types/domain/user";
import { handleReadUnauth } from "@/data/auth/handleReadUnauth";

export function obtainListDetails(
    listId: string,
    pageNum: number,
    limit: number,
    query: string | null,
    setUser: (user: User | null) => void,
    setTotalPages: (totalPages: number) => void,
    _navigate: any,
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
        handleReadUnauth(error, setUser)
    })
}

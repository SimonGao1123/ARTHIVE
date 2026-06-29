import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import type { Dispatch, SetStateAction } from "react"

export function saveListFunction(
    setCurrSaved: Dispatch<SetStateAction<boolean>>,
    saveList: any,
    listId: string,
    setUser: (user: User | null) => void,
    navigate: any,
    setSaveCount: Dispatch<SetStateAction<number>>
) {
    saveList({
        variables: {
            input: {
                listId: listId
            }
        }
    }).then((res: any) => {
        const serverSaved: boolean = res.data.saveList
        setCurrSaved(serverSaved)
        setSaveCount((prev: number) => serverSaved ? prev + 1 : prev - 1)
    }).catch((err: any) => {
        setCurrSaved(prev => !prev)
        setSaveCount((prev: number) => prev)
        handleMutationUnauth(err, setUser, navigate)
    })
}

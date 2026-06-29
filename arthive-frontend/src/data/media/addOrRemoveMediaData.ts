import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


// only supports adding one media to one list at a time
export function addOrRemoveMediaData(
    addOrRemoveMediaInListMutation: any,
    listId: string,
    mediaIds: string[],
    setUser: (user: User | null) => void,
    navigate: any,
    ifAdd: boolean,
    onSuccess?: () => void,
) {
    addOrRemoveMediaInListMutation({
        variables: {
            input: {
                listId: listId,
                ifAdd: ifAdd,
                mediaIds: mediaIds
            }
        }
    })
    .then(() => {
        onSuccess?.()
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}
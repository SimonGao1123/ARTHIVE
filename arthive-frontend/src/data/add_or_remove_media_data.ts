import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

// only supports adding one media to one list at a time
export function addOrRemoveMediaData(
    addOrRemoveMediaInListMutation: any, 
    listId: string, 
    mediaIds: string[],
    setUser: (user: User | null) => void,
    navigate: any,
    ifAdd: boolean,
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
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
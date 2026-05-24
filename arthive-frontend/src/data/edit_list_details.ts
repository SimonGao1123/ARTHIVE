import type { Dispatch, SetStateAction } from "react";
import type { ListType } from "../types/queries/lists_request_queries";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function editListDetails(
    listId: string,
    name: string | null,
    ifPrivate: boolean | null,
    tags: string | null,
    description: string | null,
    setUser: (user: User | null) => void,
    navigate: any,
    editListDetails: any,
    setListData: Dispatch<SetStateAction<ListType | null>>
) {
    const normalizedTags = tags?.split(",").map((tag: string) => tag.trim())
    editListDetails({
        variables: {
            input: {
                listId: listId,
                name: name,
                ifPrivate: ifPrivate,
                tags: normalizedTags,
                description: description
            }
        }
    })
    .then((data: any) => {
        setListData(data.data.editListDetails)
        alert("List details edited successfully")
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
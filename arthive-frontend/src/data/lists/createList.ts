import { logout } from "@/data/auth/logout"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function createList(
    name: string,
    description: string,
    tags: string,
    addedMediaIds: string[],
    ifPrivate: boolean,
    setUser: any, 
    navigate: any, 
    createList: any
) {

    const normalizedTags = tags.split(",").map((tag: string) => tag.trim())
    
    createList({
        variables: {
            input: {
                name: name,
                description: description==="" ? null : description,
                tags: normalizedTags,
                addedMediaIds: addedMediaIds,
                ifPrivate: ifPrivate
            }
        }
    })
    .then((_data: any) => {
    }).catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
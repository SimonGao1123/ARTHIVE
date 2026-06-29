import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

export function whoAmIQuery(whoami: any, navigate: any, setUser: any) {
    whoami()
    .then((userData: any) => {
        if (userData.data.whoami) {
            setUser(userData.data.whoami)
        } else {
            setUser(null)
        }
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)
    })
}

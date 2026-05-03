import { logout } from "./logout"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function whoAmIQuery(whoami: any, navigate: any, setUser: any) {
    whoami().
    then((userData: any) => {
        console.log("userData in whoAmIQuery", userData)
        if (userData.data.whoami) {
            setUser(userData.data.whoami)
        } else {
            setUser(null)
            logout(setUser, navigate)
        }
    })
    .catch((error: any) => {
        console.log("error in whoAmIQuery", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
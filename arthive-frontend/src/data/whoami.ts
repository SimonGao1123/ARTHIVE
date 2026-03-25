import { logout } from "./logout"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export async function whoAmIQuery(whoami: any, navigate: any, setUser: any) {
    try {
        const userData = await whoami()
        return userData.data.whoami ?? null
    } catch (error: any) {
        console.log("error in whoAmIQuery", error.message)

        // redirect to login if the user is unauthenticated
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
            return null
        }
        return null
    }
}
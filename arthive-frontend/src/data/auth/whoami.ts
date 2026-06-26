import { client } from "@/apollo/apollo"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

function clearStaleToken(setUser: any) {
    localStorage.removeItem("authToken")
    setUser(null)
    try { client.clearStore() } catch {}
}

export function whoAmIQuery(whoami: any, _navigate: any, setUser: any) {
    whoami()
    .then((userData: any) => {
        if (userData.data.whoami) {
            setUser(userData.data.whoami)
        } else {
            // null whoami = public mode; if a stale token is sitting in storage, clear it
            if (localStorage.getItem("authToken")) {
                clearStaleToken(setUser)
            } else {
                setUser(null)
            }
        }
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            if (localStorage.getItem("authToken")) {
                clearStaleToken(setUser)
            } else {
                setUser(null)
            }
        }
    })
}

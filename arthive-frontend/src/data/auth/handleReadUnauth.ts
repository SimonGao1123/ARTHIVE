import { client } from "@/apollo/apollo"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

// For read paths that can succeed in public mode.
// - If the error is a stale-token unauth message, clear the token + apollo store
//   and drop the user to null. Never navigates — the page stays where it is.
// - Returns true if the error was handled (caller should stop), false otherwise.
export function handleReadUnauth(
    error: any,
    setUser: (user: any) => void,
): boolean {
    if (!error || !error.message) return false

    if (unauth_messages.includes(error.message)) {
        if (localStorage.getItem("authToken")) {
            try { localStorage.removeItem("authToken") } catch {}
            try { client.clearStore() } catch {}
        }
        setUser(null)
        return true
    }

    return false
}

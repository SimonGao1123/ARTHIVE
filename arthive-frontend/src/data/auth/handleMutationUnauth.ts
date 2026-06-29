import { unauth_messages } from "@/shared/utils/globalConstants"

// For mutation paths that hit an unauthenticated error.
// Clears local user state and bounces to /login. Does NOT call the logout mutation —
// the backend session is already dead (that's why we got the error); calling logout
// would just bump token_version again, a wasted round-trip.
// Returns true if the error was handled (caller should stop), false otherwise.

export function handleMutationUnauth(
    error: any,
    setUser: (user: any) => void,
    navigate: any,
): boolean {
    if (!error?.message) return false

    if (unauth_messages.includes(error.message)) {
        setUser(null)
        navigate("/login")
        return true
    }

    return false
}

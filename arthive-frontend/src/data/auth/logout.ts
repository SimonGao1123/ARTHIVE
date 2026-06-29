import { client } from "@/apollo/apollo"
import { LOGOUT_MUTATION } from "@/apollo/mutations/user_mutations"

export async function logout(setUser: any, navigate: any) {
    try {
        await client.mutate({ mutation: LOGOUT_MUTATION })
    } catch (error: any) {
        console.error(error)
    } finally {
        // honor the user's intent client-side regardless of network/server result.
        // cookie clearing is the backend's job — JS can't touch the httpOnly cookie.
        // cache will refresh naturally on the next page mount.
        setUser(null)
        navigate("/login")
    }
}

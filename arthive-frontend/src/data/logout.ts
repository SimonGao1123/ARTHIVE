import {client} from "../lib/apollo"
export function logout(setUser: any, navigate: any) {
    try {
        localStorage.removeItem("authToken")
        setUser(null)
        client.clearStore()
        navigate("/login")
    } catch (error: any) {
    }
}
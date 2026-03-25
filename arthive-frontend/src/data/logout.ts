export function logout(setUser: any, navigate: any) {
    try {
        localStorage.removeItem("authToken")
        setUser(null)
        navigate("/login")
    } catch (error: any) {
        console.log("error in logout", error)
    }
}
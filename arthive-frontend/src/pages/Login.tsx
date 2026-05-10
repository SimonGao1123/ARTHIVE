import { useState, type Dispatch, type SetStateAction } from "react"
import { useMutation } from "@apollo/client/react"
import type { LoginInput } from "../types/mutations/user_login_mutations"
import type { LoginUserMutation } from "../types/mutations/user_login_mutations"
import { LOGIN_USER } from "../types/mutations/user_login_mutations"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"

type LoginPageProps = {
  setUser: Dispatch<SetStateAction<User | null>>
}

export default function Login({ setUser }: LoginPageProps) {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [loginUser, {loading, error}] = useMutation<LoginUserMutation, LoginInput>(LOGIN_USER)
    const navigate = useNavigate()
    return (
        <div>
            <h1>Login</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => {
                loginUser({variables: {input: {email, password}}})
                .then((loginData: any) => {
                    if (loginData.data?.login.user && loginData.data.login.token) {
                        setUser(loginData.data.login.user)
                        localStorage.setItem("authToken", loginData.data.login.token)
                        navigate("/")
                    } else {
                        console.error(loginData.data?.login.errors)
                    }
                })
                .catch((error: any) => {
                    console.error(error);
                })
                }}>Login</button>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}

            <p>Don't have an account? <button onClick={() => navigate("/register")}>Register here</button></p>
        </div>
    )


}
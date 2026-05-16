import { useState } from "react";
import type { CreateUserInput } from "../types/mutations/user_login_mutations";
import type { CreateUserMutation } from "../types/mutations/user_login_mutations";
import { CREATE_USER } from "../types/mutations/user_login_mutations";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom"

export default function Register() {
    const [email, setEmail] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [createUser, {loading, error}] = useMutation<CreateUserMutation, CreateUserInput>(CREATE_USER)
    const navigate = useNavigate()

    return (
        <div>
            <h1>Register</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => {
                handleRegister(email, username, password, createUser).
                then((user) => {
                    if (user) {
                        navigate("/login")
                    }
                }).catch(() => {})
            }}>Register</button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}

            <p>Already have an account? <button onClick={() => navigate("/login")}>Login Here</button></p>
        </div>
    )
}

async function handleRegister(email: string, username: string, password: string, createUser: any) {
    try {
        const createUserData = await createUser({variables: {input: {email, username, password}}});
        if (createUserData.data?.createUser.id) {
            return createUserData.data.createUser
        }
        return null
        
    } catch (error) {
        console.error(error);
        
    }
}
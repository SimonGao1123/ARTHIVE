import { useState, type Dispatch, type SetStateAction } from "react"
import { useMutation } from "@apollo/client/react"
import type { LoginInput } from "../types/mutations/user_login_mutations"
import type { LoginUserMutation } from "../types/mutations/user_login_mutations"
import { LOGIN_USER } from "../types/mutations/user_login_mutations"
import type { User } from "../types/user_types"
import { client } from "../lib/apollo"
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-[#171519] rounded-2xl border border-white/5 p-8 w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-violet-500">ARTHIVE</h1>
                    <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                    />
                </div>

                <button
                    disabled={loading}
                    onClick={() => {
                        loginUser({ variables: { input: { email, password } } })
                            .then((loginData: any) => {
                                if (loginData.data?.login.user && loginData.data.login.token) {
                                    setUser(loginData.data.login.user)
                                    localStorage.setItem("authToken", loginData.data.login.token)
                                    client.resetStore()
                                    navigate("/")

                                }
                            })
                            .catch(() => {})
                    }}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full transition mt-2"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>

                {error && (
                    <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
                        {error.message}
                    </p>
                )}

                <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{" "}
                    <button
                        onClick={() => navigate("/register")}
                        className="text-violet-400 hover:text-violet-300 transition font-medium"
                    >
                        Register here
                    </button>
                </p>
            </div>
        </div>
    )


}
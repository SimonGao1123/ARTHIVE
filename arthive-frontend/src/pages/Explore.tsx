import { logout } from "../data/logout"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"

type ExplorePageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function ExplorePage({ setUser, user }: ExplorePageProps) {
    const navigate = useNavigate()
    return (
        <div>
            <h1>Explore</h1>
            {user && <p>Welcome, {user.username}</p>}
            <button onClick={() => {
                logout(setUser, navigate)
            }}>Logout</button>
        </div>
    )
}
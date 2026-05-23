import { logout } from "../data/logout"
import HottestExplorePageMediaLibrary from "../lib/HottestExplorePageMediaLibrary"
import NewestExplorePageMediaLibrary from "../lib/NewestExplorePageMediaLibrary"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ContentFilter from "../lib/ContentFilter"

type ExplorePageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

const LIMIT = 5;
export default function ExplorePage({ setUser, user }: ExplorePageProps) {
    const navigate = useNavigate()

    const [currContentType, setCurrContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    return (
        <div>
            <h1 className="text-2xl font-bold">Explore</h1>
            {user && <p>Welcome, {user.username}</p>}

            <ContentFilter currContentType={currContentType} setContentType={setCurrContentType} />

            <h3>Newest</h3>
            {user && <NewestExplorePageMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}

            <h3>Trending</h3>
            {user && <HottestExplorePageMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            <button onClick={() => {
                logout(setUser, navigate)
            }}>Logout</button>
            
        </div>
    )
}
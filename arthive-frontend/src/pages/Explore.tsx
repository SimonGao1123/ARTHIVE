import { logout } from "../data/logout"
import HottestExplorePageMediaLibrary from "../lib/HottestExplorePageMediaLibrary"
import NewestExplorePageMediaLibrary from "../lib/NewestExplorePageMediaLibrary"
import BecauseOfReviewsExplorePageMediaLibrary from "../lib/BecauseOfReviewsExplorePageMediaLibrary"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ContentFilter from "../lib/ContentFilter"
import TrendingLists from "../lib/TrendingLists"

type ExplorePageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

const LIMIT = 6
export default function ExplorePage({ setUser, user }: ExplorePageProps) {
    const navigate = useNavigate()
    const [currContentType, setCurrContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Explore</h1>
                    {user && <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user.username}</p>}
                </div>
                <button
                    onClick={() => logout(setUser, navigate)}
                    className="text-sm text-gray-500 hover:text-white transition"
                >
                    Sign out
                </button>
            </div>

            <ContentFilter currContentType={currContentType} setContentType={setCurrContentType} />

            

            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Trending</span>
                    <span className="text-xs text-gray-500">Most active this week</span>
                </div>
                {user && <HottestExplorePageMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                {user && <BecauseOfReviewsExplorePageMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Newest</span>
                    <span className="text-xs text-gray-500">Recently added</span>
                </div>
                {user && <NewestExplorePageMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Trending Lists</span>
                    <span className="text-xs text-gray-500">Most liked this week</span>
                </div>
                {user && <TrendingLists user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>
            
        </div>
    )
}

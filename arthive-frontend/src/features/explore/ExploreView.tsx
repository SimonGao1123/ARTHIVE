import { logout } from "@/data/auth/logout"
import HottestMediaLibrary from "@/features/explore/components/HottestMediaLibrary"
import NewestMediaLibrary from "@/features/explore/components/NewestMediaLibrary"
import BecauseOfReviewsMediaLibrary from "@/features/explore/components/BecauseOfReviewsMediaLibrary"
import type { User } from "@/types/domain/user"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ContentFilter from "@/shared/components/ContentFilter"
import TrendingLists from "@/features/explore/components/TrendingLists"
import TrendingReviewsCarousel from "@/features/explore/components/TrendingReviewsCarousel"

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
                {<HottestMediaLibrary setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                {user && <BecauseOfReviewsMediaLibrary user={user} setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Newest</span>
                    <span className="text-xs text-gray-500">Recently added</span>
                </div>
                {<NewestMediaLibrary setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Trending Lists</span>
                    <span className="text-xs text-gray-500">Most liked this week</span>
                </div>
                {<TrendingLists setUser={setUser} currContentType={currContentType} limit={LIMIT} />}
            </section>
            
            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Trending Reviews</span>
                    <span className="text-xs text-gray-500">Most discussed this week</span>
                </div>
                <TrendingReviewsCarousel setUser={setUser} currContentType={currContentType} limit={LIMIT} />
            </section>
        </div>
    )
}

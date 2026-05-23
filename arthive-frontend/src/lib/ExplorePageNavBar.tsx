import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/user_types";
import { useState } from "react";

type NavItem = {
    label: string
    to: string
    isActive: (pathname: string) => boolean
}

export default function ExplorePageNavBar({user}: {user: User | null}) {
    const navigate = useNavigate()
    const location = useLocation()

    const [searchQuery, setSearchQuery] = useState("")

    const navItems: NavItem[] = [
        { label: "Explore", to: "/", isActive: (p) => p === "/" },
    ]
    if (user) {
        navItems.push(
            { label: "My Logged", to: `/finished/${user.id}`, isActive: (p) => p === `/finished/${user.id}` },
            { label: "My Reviews", to: `/all_reviews/${user.id}`, isActive: (p) => p === `/all_reviews/${user.id}` },
            { label: "My Likes", to: `/liked/${user.id}`, isActive: (p) => p === `/liked/${user.id}` },
            { label: "My Lists", to: `/all_lists/${user.id}`, isActive: (p) => p === `/all_lists/${user.id}` },
            { label: "My Profile", to: `/profile/${user.id}`, isActive: (p) => p === `/profile/${user.id}` },
        )
    }

    return (
        <div className="min-h-screen flex flex-col text-white">
            <header className="px-12 py-6">
                <h1 className="text-violet-500 font-bold text-3xl uppercase tracking-wide">ARTHIVE</h1>
            </header>

            <div className="flex flex-1 gap-6 px-12 pb-12">
                <aside className="w-56 flex-shrink-0 flex flex-col gap-6">
                    <div className="flex justify-center">
                        <img
                            width={80}
                            height={80}
                            onClick={() => navigate(`/profile/${user?.id}`)}
                            src={user?.profilePicture ? user.profilePicture : "/default-ARTHIVE-pfp.png"}
                            alt="Profile Picture"
                            className="w-20 h-20 rounded-full object-cover cursor-pointer ring-2 ring-white/10 hover:ring-violet-500/50 transition"
                        />
                    </div>

                    <nav className="bg-[#171519] rounded-2xl border border-white/5 py-2">
                        {navItems.map((item) => {
                            const active = item.isActive(location.pathname)
                            return (
                                <button
                                    key={item.to}
                                    onClick={() => navigate(item.to)}
                                    className={`w-full text-left px-6 py-3 text-sm transition border-l-2 ${
                                        active
                                            ? "border-violet-500 text-white bg-white/5"
                                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                        {user?.ifAdmin && (
                            <button
                                onClick={() => navigate("/admin")}
                                className={`w-full text-left px-6 py-3 text-sm transition border-l-2 ${
                                    location.pathname === "/admin"
                                        ? "border-violet-500 text-white bg-white/5"
                                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                Admin Panel
                            </button>
                        )}
                    </nav>

                    {!location.pathname.includes("/search") && (
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                            />
                            <button
                                onClick={() => navigate(`/search?query=${searchQuery}&searchType=all`)}
                                className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 rounded-full py-2 text-sm transition"
                            >
                                Search
                            </button>
                        </div>
                    )}
                </aside>

                <main className="flex-1 min-w-0">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

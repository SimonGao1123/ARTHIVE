import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/user_types";
import { useState } from "react";

export default function ExplorePageNavBar({user}: {user: User | null}) {
    const navigate = useNavigate()
    const location = useLocation()

    const [searchQuery, setSearchQuery] = useState("")
    return (
        <>
        <nav>
            <img width={50} height={50} onClick={() => navigate(`/profile/${user?.id}`)} src={user?.profilePicture ? user.profilePicture : "/default-ARTHIVE-pfp.png"} alt="Profile Picture" className="profile-picture" />
            <button onClick={() => navigate("/") } className={location.pathname === "/" ? "active" : ""}>Explore</button>
            {user && <button onClick={() => navigate(`/all_reviews/${user.id}`)} className={location.pathname === `/${user.id}/all_reviews` ? "active" : ""}>All Reviews</button>}
            {user && <button onClick={() => navigate(`/all_lists/${user.id}`)} className={location.pathname === `/${user.id}/all_lists` ? "active" : ""}>All Lists</button>}
            {user?.ifAdmin && <button onClick={() => navigate("/admin")} className={location.pathname === "/admin" ? "active" : ""}>Admin Panel</button>}

            {!location.pathname.includes("/search") ? <><input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={() => navigate(`/search?query=${searchQuery}&searchType=all`)}>Search</button> </> : <></>}
        </nav>
        <Outlet/>
        </>
    )
}
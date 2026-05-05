import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/user_types";

export default function ExplorePageNavBar({user}: {user: User | null}) {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <>
        <nav>
            <img width={50} height={50} onClick={() => navigate("/")} src={user?.profilePicture ? user.profilePicture : "/default-ARTHIVE-pfp.png"} alt="Profile Picture" className="profile-picture" />
            <button onClick={() => navigate("/") } className={location.pathname === "/" ? "active" : ""}>Explore</button>
            {user && <button onClick={() => navigate(`/${user.id}/all_reviews`)} className={location.pathname === `/${user.id}/all_reviews` ? "active" : ""}>All Reviews</button>}
            {user?.ifAdmin && <button onClick={() => navigate("/admin")} className={location.pathname === "/admin" ? "active" : ""}>Admin Panel</button>}
        </nav>
        <Outlet/>
        </>
    )
}
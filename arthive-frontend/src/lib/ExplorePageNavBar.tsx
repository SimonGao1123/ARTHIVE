import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/user_types";

export default function ExplorePageNavBar({user}: {user: User | null}) {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <>
        <nav>
            <button onClick={() => navigate("/") } className={location.pathname === "/" ? "active" : ""}>Explore</button>
            <button onClick={() => navigate("/all_reviews")} className={location.pathname === "/all_reviews" ? "active" : ""}>All Reviews</button>
            {user?.ifAdmin && <button onClick={() => navigate("/admin")} className={location.pathname === "/admin" ? "active" : ""}>Admin Panel</button>}
        </nav>
        <Outlet/>
        </>
    )
}
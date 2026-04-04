import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ExplorePageNavBar() {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <nav>
            <button onClick={() => navigate("/") } className={location.pathname === "/" ? "active" : ""}>Explore</button>
            <button onClick={() => navigate("/all-reviews")} className={location.pathname === "/all-reviews" ? "active" : ""}>All Reviews</button>

            <Outlet/>
        </nav>
    )
}
import type { User } from "../types/user_types"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { logout } from "../data/logout"

export default function AdminPage({user, setUser}: {user: User, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const location = useLocation()

    // check if the user is logged in and is an admin
    useEffect(() => {
        if (!user) {
            logout(setUser, navigate)
            return 
        }

        if (!user.ifAdmin) {
            navigate("/")
            return
        }
    }, [user])


    return (
        <div>
            {location.pathname === "/admin" && (
                <>
                    <h1>Admin Panel</h1>
                    <Link to="/admin/upload_media">Upload Media</Link>
                </>
            )}

            <Outlet />
        </div>
    )


}
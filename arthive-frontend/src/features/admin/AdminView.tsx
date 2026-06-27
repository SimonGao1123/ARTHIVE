import type { User } from "@/types/domain/user"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { logout } from "@/data/auth/logout"

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
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
                    <div className="bg-[#171519] rounded-2xl border border-white/5 p-2">
                        <Link
                            to="/admin/upload_media"
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                        >
                            <span className="text-sm font-medium">Upload Media</span>
                            <span className="text-gray-500 text-xs">→</span>
                        </Link>

                        <Link
                            to="/admin/edit_media"
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                        >
                            <span className="text-sm font-medium">Edit Media</span>
                            <span className="text-gray-500 text-xs">→</span>
                        </Link>
                    </div>
                </div>
            )}

            <Outlet />
        </div>
    )


}
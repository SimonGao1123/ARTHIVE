import { useNavigate } from "react-router-dom"

export default function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
            <p className="text-8xl font-bold text-white/5 select-none">404</p>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-white">Page not found</h1>
                <p className="text-gray-400 text-sm max-w-xs">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
            <button
                onClick={() => navigate("/")}
                className="bg-violet-500 hover:bg-violet-400 text-white px-6 py-2.5 rounded-full text-sm transition"
            >
                Go home
            </button>
        </div>
    )
}

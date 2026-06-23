import { useParams } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { AllUserListsComponent } from "@/features/lists/components/AllUserListsComponent"
export default function AllUserListsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    if (!user_id) return null

    return (
        <div className="flex flex-col gap-4">
            <AllUserListsComponent setUser={setUser} user_id={user_id} if_adding_media={false} addOrRemoveMediaFromList={null} listsWithMedia={[]} excludeMediaId={null} />
            <button
                onClick={() => navigate("/create_list")}
                className="self-start bg-violet-500 hover:bg-violet-400 text-white px-5 py-2 rounded-full text-sm transition"
            >
                + Create New List
            </button>
        </div>
    )
}

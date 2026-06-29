import { useParams } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { AllUserListsComponent } from "@/features/lists/components/AllUserListsComponent"
import SignInPrompt from "@/shared/components/SignInPrompt"
export default function AllUserListsPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    if (!user_id) return null
    if (!user) return <SignInPrompt title="Sign in to view lists" message="Sign in to browse user lists." />

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

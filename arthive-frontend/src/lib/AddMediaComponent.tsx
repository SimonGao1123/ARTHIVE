import { useMutation } from "@apollo/client/react"
import { CREATE_THREAD_MUTATION, type CreateThreadInput, type CreateThreadResponse } from "../types/mutations/thread_mutations"
import type { User } from "../types/user_types"
import { useState, type Dispatch, type SetStateAction } from "react"
import { createThreadMutation } from "../data/create_thread_mutation"
import { useNavigate } from "react-router-dom"
import type { CommunityThread } from "../types/queries/community_request_queries"

type AddMediaComponentProps = {
    media_id: string,
    setUser: (user: User | null) => void
    parentThreadId: string | null
    rootThreadId: string | null
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>
}
export function AddMediaComponent({media_id, setUser, parentThreadId, rootThreadId, setThreads}: AddMediaComponentProps) {
    const [createThread,{loading, error}] = useMutation<CreateThreadResponse, CreateThreadInput>(CREATE_THREAD_MUTATION)
    const [content, setContent] = useState("")
    const [title, setTitle] = useState<string | null>(null)

    const navigate = useNavigate()
    
    function handleCreateThread() {
        if (content === "") {
            alert("Content is required")
            return
        }
        if (title !== null && (parentThreadId !== null || rootThreadId !== null)) {
            alert("Title cannot be present for non-root threads")
            return
        }
        createThreadMutation(createThread, media_id, content, title, parentThreadId, rootThreadId, setUser, navigate, setThreads)
    }
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <h3>Create Thread</h3>
            {parentThreadId == null && rootThreadId == null ? <input type="text" value={title ?? ""} onChange={(e) => setTitle(e.target.value)} placeholder="Title" /> : null}
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
            <button onClick={handleCreateThread}>Create Thread</button>
        </div>
    )
}
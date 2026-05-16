import type { CommunityThread } from "../types/queries/community_request_queries"
import { useMutation } from "@apollo/client/react"
import { LIKE_THREAD_MUTATION, type LikeThreadInput, type LikeThreadResponse } from "../types/mutations/thread_mutations"
import { useState, type Dispatch, type SetStateAction } from "react"
import { likeThreadFunction } from "../data/like_thread_function"
import type { User } from "../types/user_types"
import type { NavigateFunction } from "react-router-dom"
export function CommunityThreadPaginated({thread, setUser, navigate, media_id}: {thread: CommunityThread, setUser: (user: User | null) => void, navigate: NavigateFunction, media_id: string}) {

    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [currLiked, setCurrLiked] = useState(thread.ifLiked)
    const [likeCount, setLikeCount] = useState(thread.likesCount)

    function handleLikeThread() {
        likeThreadFunction(setCurrLiked, likeThread, thread.id, setUser, navigate, setLikeCount)
    }
    return (
        <div key={thread.id + "div"}>
            {thread.user.username && <p>By: {thread.user.username}</p>}
            <img width={50} height={50} src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" loading="lazy"/>
            {thread.title && <h3>{thread.title}</h3>}
            {thread.content && <p>{thread.content}</p>}
            <p>{thread.createdAt}</p>

            <p onClick={handleLikeThread}>{likeCount} {currLiked ? "❤️" : "🤍"}</p>
            <p onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}>{thread.childThreadsCount} 💬</p>
            <p>--------------------------------</p>
        </div>
    )
}
type CommunityThreadsProps = {
    threads: CommunityThread[],
    setLoadCount: Dispatch<SetStateAction<number>>,
    ifNextPage: boolean,
    setUser: (user: User | null) => void,
    navigate: NavigateFunction,
    media_id: string,
}
export function CommunityThreads({threads, setLoadCount, ifNextPage, setUser, navigate, media_id}: CommunityThreadsProps) {
    return (
        <div>
            {threads.map((thread) => (
                <CommunityThreadPaginated key={thread.id} thread={thread} setUser={setUser} navigate={navigate} media_id={media_id} />
            ))}
            <button onClick={() => setLoadCount(prev => prev + 1)} disabled={!ifNextPage}>Next</button>
        </div>
    )
}
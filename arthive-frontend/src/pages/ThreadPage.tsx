import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import type { ObtainThreadInput, ObtainThreadResponse } from "../types/queries/thread_request_queries"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useEffect, useRef, useState } from "react"
import type { CommunityThread } from "../types/queries/community_request_queries"
import { OBTAIN_THREAD_QUERY } from "../types/queries/thread_request_queries"
import { obtainThreadData } from "../data/obtain_thread_data"
import { CommunityThreads } from "../lib/CommunityThread"

import { LIKE_THREAD_MUTATION, type LikeThreadInput, type LikeThreadResponse } from "../types/mutations/thread_mutations"
import { likeThreadFunction } from "../data/like_thread_function"
import { AddMediaComponent } from "../lib/AddMediaComponent"
const LIMIT = 2
export default function ThreadPage({setUser}: {setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const {thread_id} = useParams()
    const {media_id} = useParams()


    const [obtainThread, {loading, error}] = useLazyQuery<ObtainThreadResponse, ObtainThreadInput>(OBTAIN_THREAD_QUERY, {
        fetchPolicy: "no-cache",
    })

    const [mainThread, setMainThread] = useState<CommunityThread | null>(null)
    const [childThreads, setChildThreads] = useState<CommunityThread[]>([])

    const [cursor, setCursor] = useState<string | null>(null)

    const [loadCount, setLoadCount] = useState(0)
    const [ifNextPage, setIfNextPage] = useState(true)

    console.log("childThreads", childThreads)
    console.log("mainThread", mainThread)

    const prevThreadIdRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        const threadChanged = prevThreadIdRef.current !== thread_id
        prevThreadIdRef.current = thread_id

        if (threadChanged) {
            setMainThread(null)
            setChildThreads([])
            setCursor(null)
            setIfNextPage(true)
            obtainThreadData(thread_id!, null, setCursor, LIMIT, obtainThread, setMainThread, setChildThreads, setIfNextPage, setUser, navigate)
        } else {
            obtainThreadData(thread_id!, cursor, setCursor, LIMIT, obtainThread, setMainThread, setChildThreads, setIfNextPage, setUser, navigate)
        }
    }, [thread_id, loadCount])
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {media_id && <button onClick={() => navigate(`/community/${media_id}`)}>Back to Community</button>}
            {mainThread && <ThreadPageContent mainThread={mainThread} media_id={media_id!} setUser={setUser} />}

            <p>======================================================</p>
            {mainThread && <AddMediaComponent media_id={media_id!} setUser={setUser} parentThreadId={mainThread.id} rootThreadId={mainThread.rootThreadId || mainThread.id} setThreads={setChildThreads} />}
            <p>======================================================</p>
            <h1>COMMENTS</h1>
            <p>======================================================</p>
            {childThreads.length > 0 && <CommunityThreads threads={childThreads} setLoadCount={setLoadCount} ifNextPage={ifNextPage} setUser={setUser} navigate={navigate} media_id={media_id!} />}
        </div>
    )
}

export function ThreadPageContent({mainThread, media_id, setUser}: {mainThread: CommunityThread, media_id: string, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()

    const [currLiked, setCurrLiked] = useState(mainThread.ifLiked)
    const [likeCount, setLikeCount] = useState(mainThread.likesCount)

    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    function handleLikeThread() {
        likeThreadFunction(setCurrLiked, likeThread, mainThread.id, setUser, navigate, setLikeCount)
    }

    return (
        <div>
            {mainThread.parentThreadId && <button onClick={() => navigate(`/community/${media_id}/thread/${mainThread.parentThreadId}`)}>Back to Parent Thread</button>}
            {mainThread.rootThreadId && <button onClick={() => navigate(`/community/${media_id}/thread/${mainThread.rootThreadId}`)}>Back to Root Thread</button>}
            {mainThread.title && <h3>{mainThread.title}</h3>}
            <img width={50} height={50} src={mainThread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" loading="lazy"/>
            <p>{mainThread.content}</p>
            <p>{mainThread.createdAt}</p>
            <p>By: {mainThread.user.username}</p>
            <p onClick={handleLikeThread}>{likeCount} {currLiked ? "❤️" : "🤍"}</p>
            <p>{mainThread.childThreadsCount} 💬</p>
        </div>
    )
}
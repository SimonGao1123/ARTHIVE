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
import { AddThreadComponent } from "../lib/AddThreadComponent"
import type { Review } from "../types/review_type"
import { ReviewReferenceCard } from "../lib/ReviewCard"
import EditThreadComponent from "../lib/EditThreadComponent"
import { LikeButton, CommentIcon } from "../lib/StyledComponents"
const LIMIT = 2
export default function ThreadPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
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
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}
            {error && <p className="text-red-400 text-sm">{error.message}</p>}

            <div className="flex gap-2">
                {media_id && (
                    <button
                        onClick={() => navigate(`/community/${media_id}`)}
                        className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
                    >
                        ← Community
                    </button>
                )}
            </div>

            {mainThread && <ThreadPageContent mainThread={mainThread} media_id={media_id!} setUser={setUser} user={user} review={mainThread.review ?? null} />}

            {mainThread && (
                <AddThreadComponent
                    media_id={media_id!}
                    setUser={setUser}
                    parentThreadId={mainThread.id}
                    rootThreadId={mainThread.rootThreadId || mainThread.id}
                    setThreads={setChildThreads}
                />
            )}

            {childThreads.length > 0 && (
                <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Replies</p>
                    <CommunityThreads threads={childThreads} setLoadCount={setLoadCount} ifNextPage={ifNextPage} setUser={setUser} navigate={navigate} media_id={media_id!} user={user} />
                </div>
            )}
        </div>
    )
}

type ThreadPageContentProps = {
    mainThread: CommunityThread
    media_id: string
    setUser: (user: User | null) => void
    user: User | null
    review: Review | null
}
export function ThreadPageContent({mainThread, media_id, setUser, user, review}: ThreadPageContentProps) {
    const navigate = useNavigate()
    const [currLiked, setCurrLiked] = useState(mainThread.ifLiked)
    const [likeCount, setLikeCount] = useState(mainThread.likesCount)
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [editPopupOpen, setEditPopupOpen] = useState(false)

    function handleLikeThread() {
        setCurrLiked(prev => !prev)
        likeThreadFunction(setCurrLiked, likeThread, mainThread.id, setUser, navigate, setLikeCount)
    }

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
                {mainThread.parentThreadId && (
                    <button
                        onClick={() => navigate(`/community/${media_id}/thread/${mainThread.parentThreadId}`)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                    >
                        ← Parent thread
                    </button>
                )}
                {mainThread.rootThreadId && (
                    <button
                        onClick={() => navigate(`/community/${media_id}/thread/${mainThread.rootThreadId}`)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                    >
                        ↑ Root thread
                    </button>
                )}
            </div>

            {mainThread.title && (
                <h2 className="text-xl font-bold text-white">{mainThread.title}</h2>
            )}

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img
                        src={mainThread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt="Profile Picture"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate(`/profile/${mainThread.user.id}`)}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{mainThread.user.username}</span>
                        <span className="text-xs text-gray-500">{new Date(mainThread.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                {user && user.id === mainThread.user.id && (
                    <button
                        onClick={() => setEditPopupOpen(true)}
                        className="text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition flex-shrink-0"
                    >
                        Edit
                    </button>
                )}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{mainThread.content}</p>

            {mainThread.imageDetails && mainThread.imageDetails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {mainThread.imageDetails.map((image) => (
                        <img key={image.signedId} src={image.url} alt="Thread image" className="h-32 w-auto rounded-lg object-cover" loading="lazy" />
                    ))}
                </div>
            )}

            <div className="flex items-center gap-6 text-gray-400 text-sm pt-2 border-t border-white/5">
                <LikeButton liked={currLiked} count={likeCount} onClick={handleLikeThread} />
                <span className="flex items-center gap-1.5">
                    <CommentIcon />
                    <span>{mainThread.childThreadsCount}</span>
                </span>
            </div>

            {review && <ReviewReferenceCard review={review} />}

            {editPopupOpen && <EditThreadComponent thread={mainThread} setUser={setUser} setEditPopupOpen={setEditPopupOpen} />}
        </div>
    )
}

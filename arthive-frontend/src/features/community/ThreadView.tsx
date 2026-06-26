import { useLocation, useNavigate, useParams } from "react-router-dom"
import type { User } from "@/types/domain/user"
import type { ObtainThreadInput, ObtainThreadResponse } from "@/types/queries/thread_queries_types"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useEffect, useRef, useState } from "react"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import { OBTAIN_THREAD_QUERY } from "@/apollo/queries/thread_queries"
import { obtainThreadData } from "@/data/community/obtainThreadData"
import { NestedThreadList } from "@/features/community/components/CommunityThread"
import { LIKE_THREAD_MUTATION } from "@/apollo/mutations/thread_mutations"
import type { LikeThreadInput, LikeThreadResponse } from "@/types/mutations/thread_mutations_types"
import { likeThreadFunction } from "@/data/community/likeThreadFunction"
import { AddThreadComponent } from "@/features/community/components/AddThreadComponent"
import type { Review } from "@/types/domain/review"
import { ReviewReferenceCard, ReviewUnavailableCard } from "@/features/archivr/components/ChatReferenceCards"
import EditThreadComponent from "@/features/community/components/EditThreadComponent"
import { LikeButton, CommentIcon } from "@/shared/components/StyledComponents"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import SignInPrompt, { SignInPromptModal } from "@/shared/components/SignInPrompt"
const LIMIT = 5
export default function ThreadPage({setUser, user}: {setUser: (user: User | null) => void, user: User | null}) {
    const navigate = useNavigate()
    const location = useLocation()
    const {thread_id} = useParams()
    const {media_id} = useParams()
    const focusThreadId = (location.state as {focusThreadId?: string} | null)?.focusThreadId ?? null

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

    useEffect(() => {
        if (!mainThread || !media_id) return
        if (mainThread.rootThreadId && mainThread.rootThreadId !== mainThread.id) {
            navigate(`/community/${media_id}/thread/${mainThread.rootThreadId}`, {
                replace: true,
                state: { focusThreadId: mainThread.id },
            })
        }
    }, [mainThread, media_id])

    const sentinelRef = useInfiniteScroll({
        hasNextPage: ifNextPage && !!user,
        loading,
        onLoadMore: () => setLoadCount(prev => prev + 1),
    })

    const repliesTopRef = useRef<HTMLDivElement | null>(null)
    const scrollRepliesToTop = () => repliesTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

    if (error) {
        navigate("/not_found")
        return null
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}

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
                    user={user}
                    media_id={media_id!}
                    setUser={setUser}
                    parentThreadId={mainThread.id}
                    rootThreadId={mainThread.rootThreadId || mainThread.id}
                    setThreads={setChildThreads}
                    onCreated={scrollRepliesToTop}
                    replyingToUsername={mainThread.user.username}
                />
            )}

            {childThreads.length > 0 && mainThread && (
                <div ref={repliesTopRef} className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Replies</p>
                    <NestedThreadList
                        threads={childThreads}
                        sentinelRef={sentinelRef}
                        ifNextPage={ifNextPage && !!user}
                        setUser={setUser}
                        user={user}
                        media_id={media_id!}
                        focusThreadId={focusThreadId}
                        parentUsername={mainThread.user.username}
                    />
                </div>
            )}

            {ifNextPage && !user && mainThread && (
                <SignInPrompt title="Sign in to see more replies" message="Sign in to keep reading replies on this thread." />
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
export function ThreadPageContent({mainThread, media_id: _media_id, setUser, user, review}: ThreadPageContentProps) {
    const navigate = useNavigate()
    const [currLiked, setCurrLiked] = useState(mainThread.ifLiked)
    const [likeCount, setLikeCount] = useState(mainThread.likesCount)
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [editPopupOpen, setEditPopupOpen] = useState(false)
    const [showSignInModal, setShowSignInModal] = useState(false)


    function handleLikeThread() {
        if (!user) { setShowSignInModal(true); return }
        setCurrLiked(prev => !prev)
        likeThreadFunction(setCurrLiked, likeThread, mainThread.id, setUser, navigate, setLikeCount)
    }

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
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

            {mainThread.hasReview && (review ? <ReviewReferenceCard review={review} /> : <ReviewUnavailableCard />)}

            {editPopupOpen && <EditThreadComponent thread={mainThread} setUser={setUser} setEditPopupOpen={setEditPopupOpen} />}

            <SignInPromptModal
                open={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                title="Sign in to like this thread"
                message="Sign in to like and reply to community threads."
            />
        </div>
    )
}

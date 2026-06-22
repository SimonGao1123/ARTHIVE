import type { CommunityThread } from "../types/queries/community_request_queries"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { LIKE_THREAD_MUTATION, type LikeThreadInput, type LikeThreadResponse } from "../types/mutations/thread_mutations"
import { useEffect, useRef, useState, type RefObject } from "react"
import { likeThreadFunction } from "../data/like_thread_function"
import type { User } from "../types/user_types"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import { ReviewReferenceCard, ReviewUnavailableCard } from "./ChatReferenceCards"
import { LikeButton, CommentIcon } from "./StyledComponents"
import { OBTAIN_THREAD_QUERY, type ObtainThreadInput, type ObtainThreadResponse } from "../types/queries/thread_request_queries"
import { AddThreadComponent } from "./AddThreadComponent"
import EditThreadComponent from "./EditThreadComponent"

const MAX_DEPTH = 5
const SHOW_MORE_BATCH = 5

export function CommunityThreadPaginated({thread, setUser, navigate, media_id, user: _user}: {thread: CommunityThread, setUser: (user: User | null) => void, navigate: NavigateFunction, media_id: string, user: User | null}) {
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [currLiked, setCurrLiked] = useState(thread.ifLiked)
    const [likeCount, setLikeCount] = useState(thread.likesCount)

    function handleLikeThread() {
        setCurrLiked(prev => !prev)
        likeThreadFunction(setCurrLiked, likeThread, thread.id, setUser, navigate, setLikeCount)
    }

    return (
        <article className="bg-[#171519] rounded-2xl border border-white/5 p-5 flex flex-col gap-4 hover:border-white/10 transition">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img
                        src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt="Profile Picture"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                        loading="lazy"
                        onClick={() => navigate(`/profile/${thread.user.id}`)}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{thread.user.username}</span>
                        <span className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                {thread.community?.media?.title && (
                    <button
                        onClick={() => navigate(`/community/${media_id}`)}
                        className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-full px-3 py-1 transition truncate max-w-[160px]"
                        title={thread.community.media.title}
                    >
                        {thread.community.media.title}
                    </button>
                )}
            </div>

            {thread.title && (
                <h3
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="text-base font-semibold text-white hover:text-violet-300 cursor-pointer transition leading-snug"
                >
                    {thread.title}
                </h3>
            )}

            {thread.content && (
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{thread.content}</p>
            )}

            {thread.imageDetails && thread.imageDetails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {thread.imageDetails.map((image) => (
                        <img key={image.signedId} src={image.url} alt="Thread image" className="h-24 w-auto rounded-lg object-cover" loading="lazy" />
                    ))}
                </div>
            )}

            {thread.hasReview && (thread.review ? <ReviewReferenceCard review={thread.review} /> : <ReviewUnavailableCard />)}

            <div className="flex items-center gap-5 text-gray-500 text-sm pt-1 border-t border-white/5">
                <LikeButton liked={currLiked} count={likeCount} onClick={handleLikeThread} />
                <button
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="hover:text-white transition flex items-center gap-1.5"
                >
                    <CommentIcon />
                    <span>{thread.childThreadsCount}</span>
                </button>
                <button
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="hover:text-white transition text-xs ml-auto"
                >
                    See replies →
                </button>
            </div>
        </article>
    )
}

type CommunityThreadsProps = {
    threads: CommunityThread[]
    sentinelRef: RefObject<HTMLDivElement | null>
    ifNextPage: boolean
    setUser: (user: User | null) => void
    navigate: NavigateFunction
    media_id: string
    user: User | null
}

export function CommunityThreads({threads, sentinelRef, ifNextPage, setUser, navigate, media_id, user}: CommunityThreadsProps) {
    return (
        <div className="flex flex-col gap-3">
            {threads.map((thread) => (
                <CommunityThreadPaginated key={thread.id} thread={thread} setUser={setUser} navigate={navigate} media_id={media_id} user={user} />
            ))}
            {ifNextPage && <div ref={sentinelRef} className="h-1" />}
        </div>
    )
}

type NestedThreadCardProps = {
    thread: CommunityThread
    media_id: string
    setUser: (user: User | null) => void
    user: User | null
    focusThreadId?: string | null
    parentUsername: string | null
}

export function NestedThreadCard({thread, media_id, setUser, user, focusThreadId, parentUsername}: NestedThreadCardProps) {
    const navigate = useNavigate()
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [currLiked, setCurrLiked] = useState(thread.ifLiked)
    const [likeCount, setLikeCount] = useState(thread.likesCount)
    const [obtainThread] = useLazyQuery<ObtainThreadResponse, ObtainThreadInput>(OBTAIN_THREAD_QUERY, {fetchPolicy: "no-cache"})

    const [childThreads, setChildThreads] = useState<CommunityThread[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [editPopupOpen, setEditPopupOpen] = useState(false)

    const cardRef = useRef<HTMLDivElement>(null)
    const canNest = thread.depth < MAX_DEPTH
    const isFocused = focusThreadId != null && focusThreadId === thread.id
    const rootIdForReply = thread.rootThreadId || thread.id

    function fetchReplies(after: string | null, first: number) {
        setLoading(true)
        obtainThread({variables: {threadId: thread.id, after, first}})
            .then((data: any) => {
                const batch = data.data.obtainThread
                const newChildren: CommunityThread[] = batch.childThreads.edges.map((edge: any) => edge.node)
                setChildThreads(prev => {
                    const existingIds = new Set(prev.map(t => t.id))
                    return [...prev, ...newChildren.filter(t => !existingIds.has(t.id))]
                })
                setHasNextPage(batch.childThreads.pageInfo.hasNextPage)
                setCursor(batch.childThreads.pageInfo.endCursor)
                setInitialLoaded(true)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (canNest && thread.childThreadsCount > 0 && !initialLoaded) {
            fetchReplies(null, 1)
        }
    }, [thread.id])

    useEffect(() => {
        if (isFocused && cardRef.current) {
            cardRef.current.scrollIntoView({behavior: "smooth", block: "center"})
        }
    }, [isFocused])

    function handleLikeThread() {
        setCurrLiked(prev => !prev)
        likeThreadFunction(setCurrLiked, likeThread, thread.id, setUser, navigate, setLikeCount)
    }

    return (
        <div ref={cardRef} className="flex flex-col gap-3">
            <article className={`bg-[#171519] rounded-2xl border p-5 flex flex-col gap-3 transition ${isFocused ? "border-violet-500/60 ring-2 ring-violet-500/40" : "border-white/5 hover:border-white/10"}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt="Profile Picture"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            loading="lazy"
                            onClick={() => navigate(`/profile/${thread.user.id}`)}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{thread.user.username}</span>
                            <span className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {user && user.id === thread.user.id && (
                        <button
                            onClick={() => setEditPopupOpen(true)}
                            className="text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition flex-shrink-0"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {thread.content && (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {parentUsername && (
                            <span className="text-violet-300 font-medium">@{parentUsername} </span>
                        )}
                        {thread.content}
                    </p>
                )}

                {thread.imageDetails && thread.imageDetails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {thread.imageDetails.map((image) => (
                            <img key={image.signedId} src={image.url} alt="Thread image" className="h-24 w-auto rounded-lg object-cover" loading="lazy" />
                        ))}
                    </div>
                )}

                {thread.hasReview && (thread.review ? <ReviewReferenceCard review={thread.review} /> : <ReviewUnavailableCard />)}

                <div className="flex items-center gap-5 text-gray-500 text-sm pt-1 border-t border-white/5">
                    <LikeButton liked={currLiked} count={likeCount} onClick={handleLikeThread} />
                    <span className="flex items-center gap-1.5">
                        <CommentIcon />
                        <span>{thread.childThreadsCount}</span>
                    </span>
                    {canNest && (childThreads.length > 0 || hasNextPage) && (
                        <button
                            onClick={() => setCollapsed(prev => !prev)}
                            className="text-gray-400 hover:text-white transition text-xs"
                        >
                            {collapsed ? "Show replies" : "Hide replies"}
                        </button>
                    )}
                    {canNest && user && (
                        <div className="ml-auto">
                            <AddThreadComponent
                                media_id={media_id}
                                setUser={setUser}
                                parentThreadId={thread.id}
                                rootThreadId={rootIdForReply}
                                setThreads={setChildThreads}
                                replyingToUsername={thread.user.username}
                            />
                        </div>
                    )}
                </div>
            </article>

            {canNest && !collapsed && (childThreads.length > 0 || hasNextPage) && (
                <div className="pl-4 ml-3 border-l border-white/10 flex flex-col gap-3">
                    {childThreads.map((child) => (
                        <NestedThreadCard
                            key={child.id}
                            thread={child}
                            media_id={media_id}
                            setUser={setUser}
                            user={user}
                            focusThreadId={focusThreadId}
                            parentUsername={thread.user.username}
                        />
                    ))}
                    {hasNextPage && (
                        <button
                            disabled={loading}
                            onClick={() => fetchReplies(cursor, SHOW_MORE_BATCH)}
                            className="text-violet-400 hover:text-violet-300 text-sm self-start transition disabled:opacity-50"
                        >
                            {loading ? "Loading…" : "Show more replies"}
                        </button>
                    )}
                </div>
            )}

            {editPopupOpen && <EditThreadComponent thread={thread} setUser={setUser} setEditPopupOpen={setEditPopupOpen} />}
        </div>
    )
}

type NestedThreadListProps = {
    threads: CommunityThread[]
    sentinelRef: RefObject<HTMLDivElement | null>
    ifNextPage: boolean
    setUser: (user: User | null) => void
    user: User | null
    media_id: string
    focusThreadId?: string | null
    parentUsername: string | null
}

export function NestedThreadList({threads, sentinelRef, ifNextPage, setUser, user, media_id, focusThreadId, parentUsername}: NestedThreadListProps) {
    return (
        <div className="flex flex-col gap-3">
            {threads.map((thread) => (
                <NestedThreadCard
                    key={thread.id}
                    thread={thread}
                    media_id={media_id}
                    setUser={setUser}
                    user={user}
                    focusThreadId={focusThreadId}
                    parentUsername={parentUsername}
                />
            ))}
            {ifNextPage && <div ref={sentinelRef} className="h-1" />}
        </div>
    )
}

import type { CommunityThread } from "../types/queries/community_request_queries"
import { useMutation } from "@apollo/client/react"
import { LIKE_THREAD_MUTATION, type LikeThreadInput, type LikeThreadResponse } from "../types/mutations/thread_mutations"
import { useState, type Dispatch, type SetStateAction } from "react"
import { likeThreadFunction } from "../data/like_thread_function"
import type { User } from "../types/user_types"
import type { NavigateFunction } from "react-router-dom"
import { ReviewReferenceCard } from "./ReviewCard"

export function CommunityThreadPaginated({thread, setUser, navigate, media_id}: {thread: CommunityThread, setUser: (user: User | null) => void, navigate: NavigateFunction, media_id: string}) {
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [currLiked, setCurrLiked] = useState(thread.ifLiked)
    const [likeCount, setLikeCount] = useState(thread.likesCount)

    function handleLikeThread() {
        likeThreadFunction(setCurrLiked, likeThread, thread.id, setUser, navigate, setLikeCount)
    }

    return (
        <article className="border-b border-white/5 py-4 first:pt-0 last:border-b-0 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <img
                    src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                    alt="Profile Picture"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{thread.user.username}</span>
                    <span className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {thread.title && (
                <h3
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="text-base font-semibold text-white hover:text-violet-300 cursor-pointer transition"
                >
                    {thread.title}
                </h3>
            )}

            {thread.content && (
                <p className="text-gray-300 text-sm leading-relaxed">{thread.content}</p>
            )}

            {thread.imageDetails && thread.imageDetails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {thread.imageDetails.map((image) => (
                        <img key={image.signedId} src={image.url} alt="Thread image" className="h-24 w-auto rounded-lg object-cover" loading="lazy" />
                    ))}
                </div>
            )}

            <div className="flex items-center gap-6 text-gray-400 text-sm">
                <button onClick={handleLikeThread} className="hover:text-white transition flex items-center gap-1.5">
                    <span>{currLiked ? "❤️" : "🤍"}</span>
                    <span>{likeCount}</span>
                </button>
                <button
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="hover:text-white transition flex items-center gap-1.5"
                >
                    <span>💬</span>
                    <span>{thread.childThreadsCount}</span>
                </button>
            </div>

            {thread.review && <ReviewReferenceCard review={thread.review} />}
        </article>
    )
}

type CommunityThreadsProps = {
    threads: CommunityThread[]
    setLoadCount: Dispatch<SetStateAction<number>>
    ifNextPage: boolean
    setUser: (user: User | null) => void
    navigate: NavigateFunction
    media_id: string
}

export function CommunityThreads({threads, setLoadCount, ifNextPage, setUser, navigate, media_id}: CommunityThreadsProps) {
    return (
        <div className="flex flex-col">
            {threads.map((thread) => (
                <CommunityThreadPaginated key={thread.id} thread={thread} setUser={setUser} navigate={navigate} media_id={media_id} />
            ))}
            {ifNextPage && (
                <button
                    onClick={() => setLoadCount(prev => prev + 1)}
                    className="w-full text-violet-400 hover:text-violet-300 py-3 text-sm transition mt-2"
                >
                    Load More
                </button>
            )}
        </div>
    )
}

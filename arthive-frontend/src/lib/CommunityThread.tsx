import type { CommunityThread } from "../types/queries/community_request_queries"
import { useMutation } from "@apollo/client/react"
import { LIKE_THREAD_MUTATION, type LikeThreadInput, type LikeThreadResponse } from "../types/mutations/thread_mutations"
import { useState, type Dispatch, type SetStateAction } from "react"
import { likeThreadFunction } from "../data/like_thread_function"
import type { User } from "../types/user_types"
import type { NavigateFunction } from "react-router-dom"
import { ReviewReferenceCard } from "./ReviewCard"

export function CommunityThreadPaginated({thread, setUser, navigate, media_id, user}: {thread: CommunityThread, setUser: (user: User | null) => void, navigate: NavigateFunction, media_id: string, user: User | null}) {
    const [likeThread] = useMutation<LikeThreadResponse, LikeThreadInput>(LIKE_THREAD_MUTATION)
    const [currLiked, setCurrLiked] = useState(thread.ifLiked)
    const [likeCount, setLikeCount] = useState(thread.likesCount)

    function handleLikeThread() {
        likeThreadFunction(setCurrLiked, likeThread, thread.id, setUser, navigate, setLikeCount)
    }

    return (
        <article className="bg-[#171519] rounded-2xl border border-white/5 p-5 flex flex-col gap-4 hover:border-white/10 transition">
            {/* Author row */}
            <div className="flex items-center justify-between gap-3">
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
            </div>

            {/* Title */}
            {thread.title && (
                <h3
                    onClick={() => navigate(`/community/${media_id}/thread/${thread.id}`)}
                    className="text-base font-semibold text-white hover:text-violet-300 cursor-pointer transition leading-snug"
                >
                    {thread.title}
                </h3>
            )}

            {/* Content */}
            {thread.content && (
                <p className="text-gray-300 text-sm leading-relaxed">{thread.content}</p>
            )}

            {/* Images */}
            {thread.imageDetails && thread.imageDetails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {thread.imageDetails.map((image) => (
                        <img key={image.signedId} src={image.url} alt="Thread image" className="h-24 w-auto rounded-lg object-cover" loading="lazy" />
                    ))}
                </div>
            )}

            {/* Referenced review */}
            {thread.review && <ReviewReferenceCard review={thread.review} />}

            {/* Footer actions */}
            <div className="flex items-center gap-5 text-gray-500 text-sm pt-1 border-t border-white/5">
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
    user: User | null
}

export function CommunityThreads({threads, setLoadCount, ifNextPage, setUser, navigate, media_id, user}: CommunityThreadsProps) {
    return (
        <div className="flex flex-col gap-3">
            {threads.map((thread) => (
                <CommunityThreadPaginated key={thread.id} thread={thread} setUser={setUser} navigate={navigate} media_id={media_id} user={user} />
            ))}
            {ifNextPage && (
                <button
                    onClick={() => setLoadCount(prev => prev + 1)}
                    className="w-full text-gray-500 hover:text-white py-3 text-sm transition border border-white/5 rounded-2xl hover:bg-white/[0.02]"
                >
                    Load more
                </button>
            )}
        </div>
    )
}

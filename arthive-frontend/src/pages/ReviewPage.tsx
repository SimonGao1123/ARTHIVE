import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import type { MainReview, ReviewComment } from "../types/review_type"
import { OBTAIN_REVIEW_PAGE_QUERY, type ObtainReviewPageResponse, type ObtainReviewPageInput } from "../types/queries/review_request_queries"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { obtainReviewPageFunction } from "../data/obtain_review_page"
import DisplayRating from "../lib/DisplayRating"
import { LIKE_REVIEW_MUTATION, type LikeReviewInput, type LikeReviewResponse } from "../types/mutations/like_review_mutation"
import { likeReviewFunction } from "../data/like_review"
import { WRITE_COMMENT_MUTATION, type WriteCommentInput, type WriteCommentResponse } from "../types/mutations/write_comment_mutation"
import { writeReviewCommentFunction } from "../data/write_review_comment"

const LIMIT = 10

export default function ReviewPage({setUser}: {setUser: (user: User | null) => void}) {
    const {review_id} = useParams()
    const navigate = useNavigate()

    const [mainReview, setMainReview] = useState<MainReview | null>(null)
    const [reviewComments, setReviewComments] = useState<ReviewComment[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [loadCount, setLoadCount] = useState(0)
    const [ifNextPage, setIfNextPage] = useState(true)
    const [commentCount, setCommentCount] = useState<number>(0)
    const [showCommentModal, setShowCommentModal] = useState(false)

    useEffect(() => {
        setCommentCount(mainReview?.commentCount ?? 0)
        if (mainReview && !mainReview.content) {
            navigate(`/media/${mainReview.media.id}`)
        }
    }, [mainReview])

    useEffect(() => {
        setCursor(null)
        setReviewComments([])
        setLoadCount(prev => prev + 1)
    }, [query])

    const [obtainReviewPage, {loading, error}] = useLazyQuery<ObtainReviewPageResponse, ObtainReviewPageInput>(OBTAIN_REVIEW_PAGE_QUERY)
    useEffect(() => {
        if (review_id) {
            obtainReviewPageFunction(review_id, query, cursor, setCursor, LIMIT, setUser, navigate, obtainReviewPage, setMainReview, setReviewComments, setIfNextPage)
        }
    }, [review_id, loadCount, query])

    if (error) {
        navigate("/not_found")
        return
    }
    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}
            
            {mainReview && (
                <MainReviewComponent
                    commentCount={commentCount}
                    mainReview={mainReview}
                    setUser={setUser}
                    onWriteComment={() => setShowCommentModal(true)}
                />
            )}

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Comments</p>
                    <button
                        onClick={() => setShowCommentModal(true)}
                        className="flex items-center gap-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-full text-sm transition"
                    >
                        <span className="text-lg leading-none">+</span>
                        Comment
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
                        <input
                            type="text"
                            placeholder="Search comments"
                            value={currQuery}
                            onChange={(e) => setCurrQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery) }}
                            className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <button
                        disabled={query === currQuery}
                        onClick={() => setQuery(currQuery)}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                    >
                        Search
                    </button>
                </div>

                <div className="flex flex-col">
                    {reviewComments.map((comment) => (
                        <UserReviewCommentComponent key={comment.id} comment={comment} />
                    ))}
                    {reviewComments.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>
                    )}
                </div>

                {ifNextPage && (
                    <button
                        onClick={() => setLoadCount(prev => prev + 1)}
                        className="w-full text-violet-400 hover:text-violet-300 py-2 text-sm transition"
                    >
                        Load More
                    </button>
                )}
            </div>

            {showCommentModal && review_id && (
                <WriteCommentModal
                    reviewId={review_id}
                    setReviewComments={setReviewComments}
                    setCommentCount={setCommentCount}
                    setUser={setUser}
                    navigate={navigate}
                    onClose={() => setShowCommentModal(false)}
                />
            )}
        </div>
    )
}

function WriteCommentModal({reviewId, setReviewComments, setCommentCount, setUser, navigate, onClose}: {
    reviewId: string
    setReviewComments: Dispatch<SetStateAction<ReviewComment[]>>
    setCommentCount: Dispatch<SetStateAction<number>>
    setUser: (user: User | null) => void
    navigate: any
    onClose: () => void
}) {
    const [comment, setComment] = useState("")
    const [writeComment] = useMutation<WriteCommentResponse, WriteCommentInput>(WRITE_COMMENT_MUTATION)

    function handleSubmit() {
        if (!comment.trim()) return
        writeReviewCommentFunction(reviewId, comment, writeComment, setUser, navigate, setReviewComments, setCommentCount)
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Write a comment</p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <textarea
                    autoFocus
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    rows={4}
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-y transition-colors"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!comment.trim()}
                        className="bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm transition"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}

function UserReviewCommentComponent({comment}: {comment: ReviewComment}) {
    const navigate = useNavigate()
    return (
        <article className="border-b border-white/5 py-4 first:pt-0 last:border-b-0 flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <img
                    src={comment.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                    alt="Profile Picture"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    loading="lazy"
                    onClick={() => navigate(`/profile/${comment.user.id}`)}
                />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{comment.user.username}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
        </article>
    )
}

function MainReviewComponent({commentCount, mainReview, setUser, onWriteComment}: {
    commentCount: number
    mainReview: MainReview
    setUser: (user: User | null) => void
    onWriteComment: () => void
}) {
    const navigate = useNavigate()
    const [currLiked, setCurrLiked] = useState(mainReview.ifLiked)
    const [likeCount, setLikeCount] = useState(mainReview.likeCount)
    const [likeReview] = useMutation<LikeReviewResponse, LikeReviewInput>(LIKE_REVIEW_MUTATION)

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
            {/* Media header */}
            <div className="flex gap-4 items-start">
                <img
                    onClick={() => navigate(`/media/${mainReview.media.id}`)}
                    src={mainReview.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                    alt={mainReview.media.title}
                    className="w-20 h-auto rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    loading="lazy"
                />
                <div className="flex flex-col gap-1 min-w-0">
                    <h1
                        onClick={() => navigate(`/media/${mainReview.media.id}`)}
                        className="text-xl font-bold text-white truncate cursor-pointer hover:text-violet-300 transition"
                    >
                        {mainReview.media.title}
                    </h1>
                    <p className="text-sm text-gray-400">By {mainReview.media.creator}</p>
                    <p className="text-sm text-gray-400">{mainReview.media.year}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {mainReview.media.genre.map((g) => (
                            <span key={g} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{g}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Author row */}
            <div className="flex items-center gap-3">
                <img
                    src={mainReview.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                    alt="Profile Picture"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    loading="lazy"
                    onClick={() => navigate(`/profile/${mainReview.user.id}`)}
                />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{mainReview.user.username}</span>
                    <span className="text-xs text-gray-500">{new Date(mainReview.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="ml-auto flex items-center gap-3 text-sm text-gray-400">
                    {mainReview.ifFinished && (
                        <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">Watched</span>
                    )}
                    {mainReview.ifFavorite && (
                        <span className="text-xs bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">Favorited</span>
                    )}
                </div>
            </div>

            {/* Rating */}
            {mainReview.rating != null && (
                <DisplayRating rating={mainReview.rating} />
            )}

            {/* Content */}
            {mainReview.content && (
                <p className="text-gray-300 text-sm leading-relaxed">{mainReview.content}</p>
            )}

            {/* Images */}
            {mainReview.imageDetails?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {mainReview.imageDetails.map((img) => (
                        <img key={img.signedId} src={img.url} alt="Review image" className="h-40 w-auto rounded-lg object-cover" />
                    ))}
                </div>
            )}

            {/* Footer actions */}
            <div className="border-t border-white/5 pt-4 flex items-center gap-6 text-sm text-gray-400">
                <button
                    onClick={() => likeReviewFunction(setCurrLiked, likeReview, mainReview.id, setUser, navigate, setLikeCount)}
                    className="hover:text-white transition flex items-center gap-1.5"
                >
                    <span>{currLiked ? "❤️" : "🤍"}</span>
                    <span>{likeCount}</span>
                </button>
                <button
                    onClick={onWriteComment}
                    className="hover:text-white transition flex items-center gap-1.5"
                >
                    <span>💬</span>
                    <span>{commentCount}</span>
                </button>
            </div>
        </div>
    )
}

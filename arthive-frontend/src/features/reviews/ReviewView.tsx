import { useNavigate, useParams } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { useEffect, useRef, useState } from "react"
import type { MainReview } from "@/types/domain/review"
import type { ReviewComment } from "@/types/domain/comment"
import { OBTAIN_REVIEW_PAGE_QUERY } from "@/apollo/queries/review_queries"
import type { ObtainReviewPageResponse, ObtainReviewPageInput } from "@/types/queries/review_queries_types"
import { useMutation } from "@apollo/client/react"
import { useDataQuery } from "@/apollo/useDataQuery"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import DisplayRating from "@/features/reviews/components/DisplayRating"
import { LIKE_REVIEW_MUTATION } from "@/apollo/mutations/review_mutations"
import type { LikeReviewInput, LikeReviewResponse } from "@/types/mutations/review_mutations_types"
import { likeReviewFunction } from "@/data/reviews/likeReview"
import WriteReviewComment from "@/features/reviews/components/WriteReviewComment"
import { LikeButton, CommentIcon } from "@/shared/components/StyledComponents"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import { SignInPromptModal } from "@/shared/components/SignInPrompt"

const LIMIT = 10

export default function ReviewPage({setUser, user}: {setUser: (user: User | null) => void, user?: User | null}) {
    const {review_id} = useParams()
    const navigate = useNavigate()

    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [commentCount, setCommentCount] = useState<number>(0)
    const [showCommentModal, setShowCommentModal] = useState(false)

    const { data, loading, error, fetchMore } = useDataQuery<ObtainReviewPageResponse, ObtainReviewPageInput>(
        OBTAIN_REVIEW_PAGE_QUERY,
        {
            variables: { reviewId: review_id ?? "", first: LIMIT, after: undefined, query },
            skip: !review_id,
            notifyOnNetworkStatusChange: true,
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])

    const mainReview: MainReview | null = data?.obtainReviewPage.review ?? null
    const fetchedComments: ReviewComment[] = data?.obtainReviewPage.reviewComments.edges.map((e) => e.node) ?? []
    const ifNextPage = data?.obtainReviewPage.reviewComments.pageInfo.hasNextPage ?? false
    const endCursor = data?.obtainReviewPage.reviewComments.pageInfo.endCursor ?? null

    // Optimistic overlay for new comments via WriteReviewComment (calls setReviewComments).
    const [optimisticComments, setOptimisticComments] = useState<ReviewComment[]>([])
    const setReviewComments = (updater: React.SetStateAction<ReviewComment[]>) => {
        setOptimisticComments((prev) => {
            const fullPrev = [...prev, ...fetchedComments]
            const next = typeof updater === "function" ? (updater as (p: ReviewComment[]) => ReviewComment[])(fullPrev) : updater
            const fetchedIds = new Set(fetchedComments.map((c) => c.id))
            return next.filter((c) => !fetchedIds.has(c.id))
        })
    }
    const reviewComments: ReviewComment[] = [...optimisticComments, ...fetchedComments]

    useEffect(() => {
        setCommentCount(mainReview?.commentCount ?? 0)
        if (mainReview && !mainReview.content) {
            navigate(`/media/${mainReview.media.id}`)
        }
    }, [mainReview])

    const sentinelRef = useInfiniteScroll({
        hasNextPage: ifNextPage,
        loading,
        onLoadMore: () => fetchMore({ variables: { after: endCursor ?? undefined } }),
    })

    const commentsTopRef = useRef<HTMLDivElement | null>(null)
    const scrollCommentsToTop = () => commentsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

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
                    user={user ?? null}
                />
            )}

            <div ref={commentsTopRef} className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Comments</p>
                    {user && (
                        <button
                            onClick={() => setShowCommentModal(true)}
                            className="flex items-center gap-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-full text-sm transition"
                        >
                            <span className="text-lg leading-none">+</span>
                            Comment
                        </button>
                    )}
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

                {ifNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>

            {showCommentModal && review_id && (
                <WriteReviewComment
                    reviewId={review_id}
                    setReviewComments={setReviewComments}
                    setCommentCount={setCommentCount}
                    setUser={setUser}
                    navigate={navigate}
                    onClose={() => setShowCommentModal(false)}
                    onCreated={scrollCommentsToTop}
                />
            )}
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

function MainReviewComponent({commentCount, mainReview, setUser, onWriteComment, user}: {
    commentCount: number
    mainReview: MainReview
    setUser: (user: User | null) => void
    onWriteComment: () => void
    user: User | null
}) {
    const navigate = useNavigate()
    const [currLiked, setCurrLiked] = useState(mainReview.ifLiked)
    const [likeCount, setLikeCount] = useState(mainReview.likeCount)
    const [likeReview] = useMutation<LikeReviewResponse, LikeReviewInput>(LIKE_REVIEW_MUTATION)
    const [showSignInModal, setShowSignInModal] = useState(false)

    function handleLikeClick() {
        if (!user) { setShowSignInModal(true); return }
        likeReviewFunction(setCurrLiked, likeReview, mainReview.id, setUser, navigate, setLikeCount)
    }

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
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{mainReview.content}</p>
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
                <LikeButton
                    liked={currLiked}
                    count={likeCount}
                    onClick={handleLikeClick}
                />
                <button
                    onClick={onWriteComment}
                    disabled={!user}
                    className="hover:text-white transition flex items-center gap-1.5 disabled:cursor-not-allowed"
                >
                    <CommentIcon />
                    <span>{commentCount}</span>
                </button>
            </div>

            <SignInPromptModal
                open={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                title="Sign in to like this review"
                message="Sign in to like reviews and join the conversation."
            />
        </div>
    )
}

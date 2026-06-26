import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_MEDIA_INFO_QUERY } from "@/apollo/queries/media_queries"
import type { ObtainMediaInfoInput, ObtainMediaInfoResponse } from "@/types/queries/media_queries_types"
import type { User } from "@/types/domain/user"
import { useNavigate, useParams } from "react-router-dom"
import type { Media } from "@/types/domain/media"
import type { Review, UserReview } from "@/types/domain/review"
import { useEffect, useState } from "react"
import { ObtainMediaDetailsFetch } from "@/data/media/obtainMediaDetails"
import { MediaInfoArticle } from "@/features/media/components/MediaInfoArticle"
import UserMediaReview from "@/features/reviews/components/UserMediaReview"
import { contentTypeColor } from "@/shared/utils/contentTypeColors"

import MediaReviews from "./components/MediaReviews"
import AddMediaToList from "@/features/media/components/AddMediaToList"

type MediaInfoPageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function MediaInfoPage({ user, setUser }: MediaInfoPageProps) {
    const { id } = useParams()

    const navigate = useNavigate()
    const [getMediaInfo, { error, loading }] = useLazyQuery<
        ObtainMediaInfoResponse,
        ObtainMediaInfoInput
    >(OBTAIN_MEDIA_INFO_QUERY)
    const [mediaInfo, setMediaInfo] = useState<Media | null>(null)

    useEffect(() => {
        const mediaId = id != null && id !== "" ? Number(id) : NaN
        if (!Number.isFinite(mediaId)) {
            navigate("/", { replace: true })
            return
        }
        try {
            ObtainMediaDetailsFetch(
                getMediaInfo,
                navigate,
                setUser,
                mediaId,
                setMediaInfo
            )
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            void message
            navigate("/", { replace: true })
        }
    }, [id])

    const showContent = Boolean(mediaInfo) && !loading

    const [showAddMediaToList, setShowAddMediaToList] = useState<boolean>(false)
    const [reviewChange, setReviewChange] = useState<{ review: Review | null; nonce: number } | null>(null)

    function handleReviewChanged(updated: UserReview | null) {
        if (!user || !mediaInfo) return
        if (updated === null) {
            setReviewChange({ review: null, nonce: Date.now() })
            return
        }
        if (!updated.content) {
            setReviewChange({ review: null, nonce: Date.now() })
            return
        }
        const review: Review = {
            id: updated.id,
            content: updated.content,
            rating: updated.rating,
            ifFavorite: updated.ifFavorite,
            ifFinished: updated.ifFinished,
            updatedAt: new Date().toISOString(),
            user: {
                id: Number(user.id),
                username: user.username,
                profilePicture: user.profilePicture ?? null,
            },
            likeCount: 0,
            commentCount: 0,
            ifLiked: false,
            imageDetails: updated.imageDetails ?? [],
        }
        setReviewChange({ review, nonce: Date.now() })
    }

    const borderColor = mediaInfo ? contentTypeColor(mediaInfo.contentType) : "#3a3a4a"

    return (
        <main className="max-w-6xl">
            {loading ? (
                <p role="status" aria-live="polite" className="text-gray-400 text-sm">
                    Loading…
                </p>
            ) : null}

            {error ? (
                <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 mb-4">
                    <p>{error.message}</p>
                </div>
            ) : null}

            {showContent && mediaInfo ? (
                <div className="grid grid-cols-[20rem_1fr] gap-6 items-start">
                    {/* Left column: cover image directly above user actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            {mediaInfo.coverImage ? (
                                <img
                                    src={mediaInfo.coverImage}
                                    alt={`Cover image for ${mediaInfo.title}`}
                                    className="w-72 aspect-[2/3] rounded-lg object-cover"
                                    style={{
                                        border: `4px solid ${borderColor}`,
                                        boxShadow: `0 0 24px ${borderColor}33`,
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-72 aspect-[2/3] rounded-lg bg-[#171519] flex items-center justify-center text-gray-500 text-sm"
                                    style={{ border: `4px solid ${borderColor}` }}
                                >
                                    No cover image
                                </div>
                            )}
                        </div>
                        {user && (
                            <UserMediaReview
                                mediaId={Number(id)}
                                setUser={setUser}
                                mediaInfo={mediaInfo}
                                onOpenAddToLists={() => setShowAddMediaToList(true)}
                                onReviewChanged={handleReviewChanged}
                            />
                        )}
                    </div>

                    {/* Right column: media info + AI summary + reviews list */}
                    <div className="flex flex-col gap-6">
                        <MediaInfoArticle media={mediaInfo} setUser={setUser} setMediaInfo={setMediaInfo}/>

                        {mediaInfo.reviewsAiSummary && (
                            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-violet-400 text-base">✦</span>
                                    <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                                        Viewers Say
                                    </h2>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{mediaInfo.reviewsAiSummary}</p>
                            </div>
                        )}
                        <MediaReviews id={id ?? ""} setUser={setUser} user={user} reviewCount={mediaInfo.reviewCount} reviewChange={reviewChange} />
                    </div>
                </div>
            ) : null}

            {showAddMediaToList && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 arthive-fade-in">
                    <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white">Add to Lists</h2>
                            <button
                                onClick={() => setShowAddMediaToList(false)}
                                className="text-gray-400 hover:text-white text-xl"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <AddMediaToList setUser={setUser} mediaId={id ?? ""} user_id={user?.id ?? ""} />
                    </div>
                </div>
            )}
        </main>
    )
}

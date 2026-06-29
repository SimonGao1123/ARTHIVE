import { useNavigate } from "react-router-dom"
import type { Media } from "@/types/domain/media"
import type { ListType } from "@/types/queries/list_queries_types"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import { contentTypeColor } from "@/shared/utils/contentTypeColors"
import DisplayRating from "@/features/reviews/components/DisplayRating"
import { CommentIcon, HeartIcon } from "@/shared/components/StyledComponents"

const BASE_CARD =
    "w-full text-left border rounded-xl p-3 transition-all duration-200 flex gap-3 items-start group"
const ACTIVE_CARD =
    "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-violet-500/30 cursor-pointer"
const UNAVAILABLE_CARD = "bg-white/[0.02] border-white/5 cursor-default opacity-60"

export function MediaReferenceCard({ media }: { media: Media }) {
    const navigate = useNavigate()
    const color = contentTypeColor(media.contentType)
    return (
        <button
            onClick={() => navigate(`/media/${media.id}`)}
            className={`${BASE_CARD} ${ACTIVE_CARD}`}
        >
            {media.coverImage ? (
                <img
                    src={media.coverImage}
                    alt={media.title}
                    className="w-10 h-auto rounded-md object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-10 h-14 rounded-md bg-white/5 flex-shrink-0" />
            )}

            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced Media</span>
                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View →</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{media.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {media.year && <span>{media.year}</span>}
                    {media.contentType && (
                        <span
                            className="px-2 py-0.5 rounded-full border capitalize"
                            style={{ borderColor: color, color, backgroundColor: `${color}20` }}
                        >
                            {media.contentType}
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}

export function ListReferenceCard({ list }: { list: ListType }) {
    const navigate = useNavigate()
    const previewMedia = (list.mediaInLists ?? []).slice(0, 3)
    return (
        <button
            onClick={() => navigate(`/list/${list.id}`)}
            className={`${BASE_CARD} ${ACTIVE_CARD}`}
        >
            {previewMedia.length > 0 ? (
                <div className="flex gap-0.5 flex-shrink-0">
                    {previewMedia.map((mil) => (
                        <img
                            key={mil.media.id}
                            src={mil.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                            alt=""
                            className="w-7 h-10 object-cover first:rounded-l-md last:rounded-r-md"
                        />
                    ))}
                </div>
            ) : (
                <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
            )}

            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced List</span>
                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View →</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{list.name}</p>

                {list.user?.username && (
                    <div className="flex items-center gap-2">
                        <img
                            src={list.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt="Profile"
                            className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="text-xs text-gray-400">{list.user.username}</span>
                    </div>
                )}

                {list.description && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{list.description}</p>
                )}

                {list.tags && list.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {list.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] text-gray-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    )
}

export function ThreadReferenceCard({ thread }: { thread: CommunityThread }) {
    const navigate = useNavigate()
    const mediaId = thread.community?.media?.id
    const onClick = () => {
        if (mediaId) navigate(`/community/${mediaId}/thread/${thread.id}`)
    }
    return (
        <button
            onClick={onClick}
            disabled={!mediaId}
            className={`${BASE_CARD} ${mediaId ? ACTIVE_CARD : UNAVAILABLE_CARD}`}
        >
            {thread.community?.media?.coverImage ? (
                <img
                    src={thread.community.media.coverImage}
                    alt={thread.community.media.title}
                    className="w-10 h-auto rounded-md object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-10 h-14 rounded-md bg-white/5 flex-shrink-0" />
            )}

            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced Thread</span>
                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View →</span>
                </div>

                {thread.community?.media?.title && (
                    <p className="text-xs text-gray-400 truncate">{thread.community.media.title}</p>
                )}

                {thread.title && (
                    <p className="text-sm font-medium text-white truncate">{thread.title}</p>
                )}

                {thread.user?.username && (
                    <div className="flex items-center gap-2">
                        <img
                            src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt="Profile"
                            className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="text-xs text-gray-400">{thread.user.username}</span>
                    </div>
                )}

                {thread.content && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{thread.content}</p>
                )}
            </div>
        </button>
    )
}

export function ReviewUnavailableCard() {
    return (
        <div className="w-full border rounded-xl p-4 flex gap-3 items-center bg-white/[0.02] border-white/5 opacity-60">
            <div className="flex flex-col gap-1.5">
                <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced Review</span>
                <p className="text-gray-500 text-xs">Review is not available</p>
            </div>
        </div>
    )
}

// for community threads referencing reviews, also used by Archivr chat for [Review::id] tokens
export function ReviewReferenceCard({ review }: { review: any }) {
    const navigate = useNavigate()

    const hasContent = !!review?.content
    return (
        <button
            onClick={() => hasContent && navigate(`/review_info/${review.id}`)}
            disabled={!hasContent}
            className={`w-full text-left border rounded-xl p-4 transition-all duration-200 flex gap-3 items-start group mx-auto ${hasContent ? "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-violet-500/30 cursor-pointer" : "bg-white/[0.02] border-white/5 cursor-default opacity-60"}`}
        >
            {review?.media?.coverImage && (
                <img
                    src={review.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                    alt={review.media.title}
                    className="w-10 h-auto rounded-md object-cover flex-shrink-0"
                />
            )}

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced Review</span>
                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View →</span>
                </div>

                {review?.media?.title && (
                    <p className="text-xs text-gray-400 truncate">{review.media.title}</p>
                )}

                <div className="flex items-center gap-2">
                    {review?.user?.profilePicture !== undefined && (
                        <img
                            src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt="Profile"
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            onClick={review?.user?.id ? (e) => { e.stopPropagation(); navigate(`/profile/${review.user.id}`) } : undefined}
                        />
                    )}
                    {review?.user?.username && (
                        <span className="text-xs font-medium text-white">{review.user.username}</span>
                    )}
                    {review?.rating != null && (
                        <span className="scale-75 origin-left"><DisplayRating rating={review.rating} /></span>
                    )}
                </div>

                {review?.content && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{review.content}</p>
                )}

                <div className="flex items-center gap-4 text-gray-500 text-xs mt-0.5">
                    <span className="flex items-center gap-1"><HeartIcon filled={false} />{review.likeCount}</span>
                    <span className="flex items-center gap-1"><CommentIcon />{review.commentCount}</span>
                </div>
            </div>
        </button>
    )
}

export function RefUnavailableCard({ label }: { label: "Media" | "Review" | "Thread" | "List" }) {
    return (
        <div className={`${BASE_CARD} ${UNAVAILABLE_CARD} items-center`}>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-xs text-violet-400 uppercase tracking-wider">Referenced {label}</span>
                <p className="text-gray-500 text-xs">{label} not available</p>
            </div>
        </div>
    )
}

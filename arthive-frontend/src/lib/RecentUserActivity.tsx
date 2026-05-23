import type { User } from "../types/user_types"
import { RECENT_USER_ACTIVITY_REQUEST } from "../types/queries/recent_user_activity_request"
import type { Activity, RecentUserActivityInput, RecentUserActivityResponse } from "../types/queries/recent_user_activity_request"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { obtainRecentUserActivityFunction } from "../data/obtain_recent_user_activity"
import { useNavigate } from "react-router-dom"
import DisplayRating from "./DisplayRating"

type RecentUserActivityProps = {
    user: User,
    setUser: (user: User | null) => void,
    navigate: any
}

const LIMIT = 10

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return new Date(iso).toLocaleDateString()
}

export default function RecentUserActivity({ user, setUser, navigate }: RecentUserActivityProps) {
    const [recentUserActivity, setRecentUserActivity] = useState<Activity[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadCount, setLoadCount] = useState<number>(0)

    const [obtainRecentUserActivity, { error, loading }] = useLazyQuery<RecentUserActivityResponse, RecentUserActivityInput>(RECENT_USER_ACTIVITY_REQUEST)

    useEffect(() => {
        obtainRecentUserActivityFunction(user.id, setRecentUserActivity, setUser, navigate, obtainRecentUserActivity, cursor, setCursor, LIMIT, setHasNextPage)
    }, [loadCount])

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 overflow-hidden">
            {loading && (
                <div className="flex flex-col divide-y divide-white/5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-4 items-start animate-pulse">
                            <div className="w-9 h-13 rounded bg-white/10 flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-2 pt-0.5">
                                <div className="h-3 bg-white/10 rounded w-1/3" />
                                <div className="h-3 bg-white/5 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm p-4">{error.message}</p>}
            {!loading && recentUserActivity.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No recent activity.</p>
            )}
            <div className="flex flex-col divide-y divide-white/5">
                {recentUserActivity.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
            {hasNextPage && (
                <button
                    onClick={() => setLoadCount(c => c + 1)}
                    className="w-full py-3 text-xs text-gray-500 hover:text-white hover:bg-white/[0.03] transition border-t border-white/5"
                >
                    Load more
                </button>
            )}
        </div>
    )
}

function ActivityCard({ activity }: { activity: Activity }) {
    const navigate = useNavigate()
    if (!activity.subject) return null
    switch (activity.subject.__typename) {
        case "Review":
            return <ReviewActivityRow review={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "ReviewComment":
            return <ReviewCommentRow reviewComment={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "ReviewLike":
            return <ReviewLikeRow reviewLike={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "ThreadLike":
            return <ThreadLikeRow threadLike={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "List":
            return <ListRow list={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "CommunityThread":
            return <ThreadRow thread={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        case "MediaInList":
            return <MediaInListRow mediaInList={activity.subject as any} createdAt={activity.createdAt} navigate={navigate} />
        default:
            return null
    }
}

type RowProps = { createdAt: string; navigate: any }

function ActivityRow({
    coverImage,
    mediaId,
    label,
    title,
    subtitle,
    extra,
    onRowClick,
    createdAt,
    navigate,
}: RowProps & {
    coverImage?: string | null
    mediaId?: string | null
    label: string
    title: string
    subtitle?: string | null
    extra?: React.ReactNode
    onRowClick: () => void
}) {
    return (
        <div className="flex gap-3 p-4 items-start hover:bg-white/[0.02] transition group">
            {coverImage ? (
                <img
                    src={coverImage}
                    alt={title}
                    onClick={(e) => { e.stopPropagation(); if (mediaId) navigate(`/media/${mediaId}`) }}
                    className="w-9 rounded object-cover flex-shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition"
                    style={{ aspectRatio: "2/3" }}
                />
            ) : (
                <div className="w-9 flex-shrink-0 rounded bg-white/5" style={{ aspectRatio: "2/3" }} />
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-pointer" onClick={onRowClick}>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 font-medium">{label}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(createdAt)}</span>
                </div>
                <p className="text-sm text-white leading-snug truncate group-hover:text-violet-100 transition">
                    {title}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{subtitle}</p>
                )}
                {extra}
            </div>
        </div>
    )
}

function ReviewActivityRow({ review, createdAt, navigate }: RowProps & { review: any }) {
    return (
        <ActivityRow
            coverImage={review.media?.coverImage}
            mediaId={review.media?.id}
            label="Reviewed"
            title={review.media?.title ?? "Unknown"}
            subtitle={review.content || undefined}
            extra={review.rating ? <DisplayRating rating={review.rating} /> : undefined}
            onRowClick={() => review.content ? navigate(`/review_info/${review.id}`) : navigate(`/media/${review.media?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function ReviewCommentRow({ reviewComment, createdAt, navigate }: RowProps & { reviewComment: any }) {
    const review = reviewComment.review
    return (
        <ActivityRow
            coverImage={review?.media?.coverImage}
            mediaId={review?.media?.id}
            label={`Commented on ${review?.user?.username ?? "someone"}'s review`}
            title={review?.media?.title ?? "Unknown"}
            subtitle={reviewComment.comment}
            onRowClick={() => review?.content ? navigate(`/review_info/${review?.id}`) : navigate(`/media/${review?.media?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function ReviewLikeRow({ reviewLike, createdAt, navigate }: RowProps & { reviewLike: any }) {
    const review = reviewLike.review
    return (
        <ActivityRow
            coverImage={review?.media?.coverImage}
            mediaId={review?.media?.id}
            label={`Liked ${review?.user?.username ?? "someone"}'s review`}
            title={review?.media?.title ?? "Unknown"}
            onRowClick={() => review?.content ? navigate(`/review_info/${review?.id}`) : navigate(`/media/${review?.media?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function ThreadLikeRow({ threadLike, createdAt, navigate }: RowProps & { threadLike: any }) {
    const thread = threadLike.communityThread
    return (
        <ActivityRow
            coverImage={thread?.community?.media?.coverImage}
            mediaId={thread?.community?.media?.id}
            label={`Liked ${thread?.user?.username ?? "someone"}'s thread`}
            title={thread?.title ?? "Untitled thread"}
            onRowClick={() => navigate(`/community/${thread?.community?.media?.id}/thread/${thread?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function ListRow({ list, createdAt, navigate }: RowProps & { list: any }) {
    return (
        <ActivityRow
            label="Created list"
            title={list.name}
            subtitle={list.description}
            onRowClick={() => navigate(`/list/${list.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function ThreadRow({ thread, createdAt, navigate }: RowProps & { thread: any }) {
    return (
        <ActivityRow
            coverImage={thread?.community?.media?.coverImage}
            mediaId={thread?.community?.media?.id}
            label="Posted thread"
            title={thread?.title ?? "Unknown thread"}
            subtitle={thread?.content}
            onRowClick={() => navigate(`/community/${thread?.community?.media?.id}/thread/${thread?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

function MediaInListRow({ mediaInList, createdAt, navigate }: RowProps & { mediaInList: any }) {
    return (
        <ActivityRow
            coverImage={mediaInList.media?.coverImage}
            mediaId={mediaInList.media?.id}
            label={`Added to list · ${mediaInList.list?.name}`}
            title={mediaInList.media?.title ?? "Unknown"}
            onRowClick={() => navigate(`/list/${mediaInList.list?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
        />
    )
}

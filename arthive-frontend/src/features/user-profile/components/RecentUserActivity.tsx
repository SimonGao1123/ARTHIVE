import type { User } from "@/types/domain/user"
import { RECENT_USER_ACTIVITY_REQUEST } from "@/apollo/queries/user_queries"
import type { Activity, ActivitySnapshot, ActivityFilterEnum, RecentUserActivityInput, RecentUserActivityResponse } from "@/types/queries/user_queries_types"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DisplayRating from "@/features/reviews/components/DisplayRating"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import { useDataQuery } from "@/apollo/useDataQuery"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"

type RecentUserActivityProps = {
    targetUserId: string,
    setUser: (user: User | null) => void,
    navigate: any
    filter: ActivityFilterEnum
}

const LIMIT = 10



export function timeAgo(iso: string): string {
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

export default function RecentUserActivity({ targetUserId, setUser, navigate, filter }: RecentUserActivityProps) {

    const [page, setPage] = useState<{cursor: string | null, filter: ActivityFilterEnum}>({cursor: null, filter: "all"})

    const [recentUserActivity, setRecentUserActivity] = useState<Activity[]>([])
    const { data, error, loading } = useDataQuery<RecentUserActivityResponse, RecentUserActivityInput>(RECENT_USER_ACTIVITY_REQUEST, {
        fetchPolicy: "no-cache",
        variables: {
            userId: targetUserId,
            filter: page.filter,
            after: page.cursor,
            first: LIMIT,
        },
    })

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])
    const hasNextPage = data?.recentUserActivity.pageInfo.hasNextPage ?? false
    const cursor = data?.recentUserActivity.pageInfo.endCursor ?? null

    // Dedup on append. In React StrictMode this effect runs twice with the
    // same `data` reference on the first render, and both invocations would
    // otherwise push the first page in — deduping by (id, __typename) makes
    // the second call a no-op. Same guard protects against any future page
    // overlap.
    useEffect(() => {
        if (!data) return
        const incoming = data.recentUserActivity.edges.map((edge) => edge.node)
        setRecentUserActivity((prev) => {
            const seen = new Set(prev.map((a) => `${a.id}-${a.subject?.__typename}`))
            return [...prev, ...incoming.filter((a) => !seen.has(`${a.id}-${a.subject?.__typename}`))]
        })
    }, [data])

    // Reset the feed and refetch when the filter changes.
    useEffect(() => {
        setRecentUserActivity([])
        setPage({cursor: null, filter: filter})
    }, [filter])

    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setPage({cursor: cursor, filter: page.filter}),
    })

    return (
        <div className="flex flex-col gap-3">
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
                    <ActivityCard key={`${activity.id}-${activity.subject?.__typename}`} activity={activity} />
                ))}
            </div>
            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    )
}

export type ActivityActor = {
    id: string
    username: string
    profilePicture: string | null
}

export function ActivityCard({ activity, actor }: { activity: Activity; actor?: ActivityActor }) {
    const navigate = useNavigate()
    const snap = activity.activitySnapshot
    if (!activity.subject) return null
    switch (activity.subject.__typename) {
        case "Review":
            return <ReviewActivityRow status={activity.status} review={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "ReviewComment":
            return <ReviewCommentRow status={activity.status} reviewComment={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "ReviewLike":
            return <ReviewLikeRow reviewLike={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "ThreadLike":
            return <ThreadLikeRow threadLike={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "ListLike":
            return <ListLikeRow listLike={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "ListSave":
            return <ListSaveRow listSave={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "List":
            return <ListRow status={activity.status} list={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "CommunityThread":
            return <ThreadRow status={activity.status} thread={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        case "MediaInList":
            return <MediaInListRow mediaInList={activity.subject as any} snap={snap} createdAt={activity.createdAt} navigate={navigate} actor={actor} />
        default:
            return null
    }
}

type RowProps = { createdAt: string; navigate: any; snap: ActivitySnapshot | null; actor?: ActivityActor }

export function ActivityRow({
    coverImage,
    mediaId,
    label,
    title,
    subtitle,
    extra,
    onRowClick,
    createdAt,
    navigate,
    actor,
}: Omit<RowProps, "snap"> & {
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
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                {actor && (
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${actor.id}`) }}
                        className="flex items-center gap-1.5 mb-0.5 self-start group/actor"
                    >
                        <img
                            src={actor.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt={actor.username}
                            className="w-4 h-4 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <span className="text-xs text-gray-500 group-hover/actor:text-gray-300 transition truncate">
                            {actor.username}
                        </span>
                    </button>
                )}
                <div className="cursor-pointer" onClick={onRowClick}>
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
        </div>
    )
}

function ReviewActivityRow({ status, review, snap, createdAt, navigate, actor }: RowProps & { status: string; review: any }) {
    const badges = (
        <div className="flex items-center gap-1.5 mt-0.5">
            {snap?.rating ? <DisplayRating rating={snap.rating} /> : null}
            {snap?.ifFinished && (
                <span className="flex items-center justify-center text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-1 rounded-full" title="Watched">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                </span>
            )}
            {snap?.ifFavorite && (
                <span className="flex items-center justify-center text-pink-300 bg-pink-500/10 border border-pink-500/20 p-1 rounded-full" title="Favorited">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </span>
            )}
        </div>
    )
    return (
        <ActivityRow
            coverImage={review.media?.coverImage}
            mediaId={review.media?.id}
            label={snap?.label ?? (status === "created" ? "Reviewed" : "Updated review")}
            title={review.media?.title ?? "Unknown"}
            subtitle={snap?.content || undefined}
            extra={snap?.rating || snap?.ifFinished || snap?.ifFavorite ? badges : undefined}
            onRowClick={() => snap?.content ? navigate(`/review_info/${review.id}`) : navigate(`/media/${review.media?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ReviewCommentRow({ status, reviewComment, snap, createdAt, navigate, actor }: RowProps & { status: string; reviewComment: any }) {
    const review = reviewComment.review
    return (
        <ActivityRow
            coverImage={review?.media?.coverImage}
            mediaId={review?.media?.id}
            label={status === "created" ? `Commented on ${snap?.reviewerUsername ?? "someone"}'s review` : "Updated comment"}
            title={review?.media?.title ?? "Unknown"}
            subtitle={snap?.comment ?? undefined}
            onRowClick={() => navigate(`/review_info/${review?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ReviewLikeRow({ reviewLike, snap, createdAt, navigate, actor }: RowProps & { reviewLike: any }) {
    const review = reviewLike.review
    return (
        <ActivityRow
            coverImage={review?.media?.coverImage}
            mediaId={review?.media?.id}
            label={`Liked ${snap?.reviewerUsername ?? "someone"}'s review`}
            title={review?.media?.title ?? "Unknown"}
            onRowClick={() => navigate(`/review_info/${review?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ThreadLikeRow({ threadLike, snap, createdAt, navigate, actor }: RowProps & { threadLike: any }) {
    const thread = threadLike.communityThread
    return (
        <ActivityRow
            coverImage={thread?.community?.media?.coverImage}
            mediaId={thread?.community?.media?.id}
            label={`Liked ${snap?.threadAuthorUsername ?? "someone"}'s thread`}
            title={snap?.threadTitle ?? "Untitled thread"}
            onRowClick={() => navigate(`/community/${thread?.community?.media?.id}/thread/${thread?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ListLikeRow({ listLike, snap, createdAt, navigate, actor }: RowProps & { listLike: any }) {
    return (
        <ActivityRow
            label="Liked list"
            title={snap?.listName ?? "Unknown list"}
            onRowClick={() => navigate(`/list/${listLike.list?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ListSaveRow({ listSave, snap, createdAt, navigate, actor }: RowProps & { listSave: any }) {
    return (
        <ActivityRow
            label="Saved list"
            title={snap?.listName ?? "Unknown list"}
            onRowClick={() => navigate(`/list/${listSave.list?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ListRow({ status, list, snap, createdAt, navigate, actor }: RowProps & { status: string; list: any }) {
    return (
        <ActivityRow
            label={status === "created" ? "Created list" : "Updated list"}
            title={snap?.listName ?? "Unknown list"}
            onRowClick={() => navigate(`/list/${list.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function ThreadRow({ status, thread, snap, createdAt, navigate, actor }: RowProps & { status: string; thread: any }) {
    return (
        <ActivityRow
            coverImage={thread?.community?.media?.coverImage}
            mediaId={thread?.community?.media?.id}
            label={snap?.label ?? (status === "created" ? "Posted thread" : "Updated thread")}
            title={snap?.title ?? "Community For " + thread.community?.media?.title}
            subtitle={snap?.threadContent ?? undefined}
            onRowClick={() => navigate(`/community/${thread?.community?.media?.id}/thread/${thread?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

function MediaInListRow({ mediaInList, snap, createdAt, navigate, actor }: RowProps & { mediaInList: any }) {
    return (
        <ActivityRow
            coverImage={mediaInList.media?.coverImage}
            mediaId={mediaInList.media?.id}
            label={`Added to list · ${snap?.listName ?? "Unknown list"}`}
            title={mediaInList.media?.title ?? "Unknown"}
            onRowClick={() => navigate(`/list/${mediaInList.list?.id}`)}
            createdAt={createdAt}
            navigate={navigate}
            actor={actor}
        />
    )
}

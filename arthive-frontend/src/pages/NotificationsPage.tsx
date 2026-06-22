import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInfiniteScroll } from "../lib/useInfiniteScroll"
import { obtainNotificationsData } from "../data/obtain_notifications_data"
import { readNotificationsData } from "../data/read_notifications"
import {
    OBTAIN_NOTIFICATIONS_QUERY,
    type Notification as NotificationData,
    type ObtainNotificationsResponse,
    type ReadNotificationsInput as ObtainNotificationsInput,
    type ObtainNotificationFilterEnum,
} from "../types/queries/obtain_notifications_query"
import {
    READ_NOTIFICATIONS_MUTATION,
    type ReadNotificationsInput,
    type ReadNotificationsResponse,
} from "../types/mutations/read_notifications_mutation"
import {
    MANIPULATE_FOLLOW_MUTATION,
    SEND_FOLLOW_MUTATION,
    type ManipulateFollowInput,
    type ManipulateFollowResponse,
    type SendFollowInput,
    type SendFollowResponse,
} from "../types/mutations/follow_mutations"
import { manipulateFollowRequest } from "../data/manipulate_follow_request"
import { sendFollowRequest } from "../data/send_follow_request"
import ListInvitationResponseButtons from "../lib/ListInvitationResponseButtons"
import type { User } from "../types/user_types"

const PAGE_SIZE = 15

const FILTERS: [ObtainNotificationFilterEnum, string][] = [
    ["all", "All"],
    ["follows", "Follows"],
    ["reviews", "Reviews"],
    ["threads", "Threads"],
    ["quote_reviews", "Quote reviews"],
    ["lists", "Lists"],
    ["list_members", "List Invites"],
]

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

function resolveNotification(n: NotificationData, navigate: (path: string) => void) {
    const go = (path: string) => navigate(path)
    const sender = n.sender?.username ?? "Someone"

    switch (n.action) {
        case "followed":
            return { label: "Followed you", title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
        case "follow_request":
            return { label: "Sent you a follow request", title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
        case "follow_request_accepted":
            return { label: "Accepted your follow request", title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
        case "follow_request_rejected":
            return { label: "Rejected your follow request", title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
        case "like_on_review":
            return {
                label: `${sender} liked your review`,
                title: (n.review as any)?.media?.title ?? "Your review",
                onClick: () => go(`/review_info/${n.review?.id}`),
            }
        case "comment_on_review":
            return {
                label: `${sender} commented on your review`,
                title: (n.review as any)?.media?.title ?? "Your review",
                subtitle: n.reviewComment?.comment,
                onClick: () => go(`/review_info/${n.review?.id}`),
            }
        case "like_on_thread":
            return {
                label: `${sender} liked your thread`,
                title: n.parentThread?.title ?? n.parentThread?.content ?? "Your thread",
                onClick: () => go(`/community/${n.parentThread?.community?.media?.id}/thread/${n.parentThread?.id}`),
            }
        case "comment_on_thread":
            return {
                label: `${sender} replied to your thread`,
                title: n.parentThread?.title ?? n.parentThread?.content ?? "Your thread",
                subtitle: n.commentThread?.content,
                onClick: () => go(`/community/${n.parentThread?.community?.media?.id}/thread/${n.commentThread?.id}`),
            }
        case "review_quoted":
            return {
                label: `${sender} quoted your review`,
                title: n.parentThread?.community?.media?.title ?? "Your review",
                onClick: () => go(`/community/${n.parentThread?.community?.media?.id}/thread/${n.parentThread?.id}`),
            }
        case "like_on_list":
            return {
                label: `${sender} liked your list`,
                title: n.list?.name ?? "Your list",
                onClick: () => go(`/list/${n.list?.id}`),
            }
        case "invite_to_list":
            return {
                label: `${sender} invited you to a list as a ${n.listMember?.role}`,
                title: n.listMember?.list?.name ?? "A list",
                onClick: () => go(`/list/${n.listMember?.list?.id}`),
            }
        case "list_invite_accepted":
            return {
                label: `${sender} accepted your list invite for the ${n.listMember?.role} role`,
                title: n.listMember?.list?.name ?? "Your list",
                onClick: () => go(`/list/${n.listMember?.list?.id}`),
            }
        default:
            return { label: n.action, title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
    }
}

function hasActionableButton(n: NotificationData, u: User | null): boolean {
    if (n.action === "follow_request") {
        return n.follow?.status === "pending" && !!u && n.follow?.receiver?.id === u.id
    }
    if (n.action === "invite_to_list") {
        return !!n.listMember && n.listMember.status === "pending"
    }
    return false
}

function NotificationRow({ notification, navigate, user, setUser, showActions, onMarkRead }: {
    notification: NotificationData
    navigate: (p: string) => void
    user: User | null
    setUser: (u: User | null) => void
    showActions: boolean
    onMarkRead?: (id: string) => void
}) {
    const r = resolveNotification(notification, navigate)
    const subtitle = (r as any).subtitle as string | undefined

    const [followStatus, setFollowStatus] = useState<string | null>(notification.follow?.status ?? null)
    const [outgoingStatus, setOutgoingStatus] = useState<string | null>(
        notification.sender?.followFromCurrentUser?.status ?? null
    )

    const [manipulateFollow] = useMutation<ManipulateFollowResponse, ManipulateFollowInput>(MANIPULATE_FOLLOW_MUTATION)
    const [sendFollow] = useMutation<SendFollowResponse, SendFollowInput>(SEND_FOLLOW_MUTATION)

    const showAcceptReject =
        showActions &&
        notification.action === "follow_request" &&
        followStatus === "pending" &&
        !!user &&
        notification.follow?.receiver?.id === user.id

    const showFollowBack =
        showActions &&
        notification.action === "followed" &&
        (outgoingStatus === null || outgoingStatus === "rejected")

    function applyFollowStatus(s: { id: string; status: string } | null) {
        setFollowStatus(s?.status ?? "rejected")
    }
    function applyOutgoingStatus(s: { id: string; status: string } | null) {
        setOutgoingStatus(s?.status ?? null)
    }

    return (
        <div
            onClick={r.onClick}
            className="flex gap-4 px-6 py-4 items-start hover:bg-white/[0.03] transition cursor-pointer border-b border-white/5 last:border-b-0"
        >
            <img
                src={notification.sender?.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                alt={notification.sender?.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-white/10"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-violet-400 font-medium leading-snug">{r.label}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-base text-white leading-snug truncate">{r.title}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{subtitle}</p>
                )}

                {showAcceptReject && (
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                manipulateFollowRequest(manipulateFollow, notification.follow!.id, "accept", navigate, applyFollowStatus, setUser as any)
                                onMarkRead?.(notification.id)
                            }}
                            className="px-3 py-1 text-xs rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 transition"
                        >
                            Accept
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                manipulateFollowRequest(manipulateFollow, notification.follow!.id, "reject", navigate, applyFollowStatus, setUser as any)
                                onMarkRead?.(notification.id)
                            }}
                            className="px-3 py-1 text-xs rounded-full border bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25 transition"
                        >
                            Reject
                        </button>
                    </div>
                )}

                {showFollowBack && (
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                sendFollowRequest(sendFollow, notification.sender.id, navigate, setUser as any, applyOutgoingStatus)
                            }}
                            className="px-3 py-1 text-xs rounded-full border border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 transition"
                        >
                            Follow back
                        </button>
                    </div>
                )}

                {showActions
                    && notification.action === "invite_to_list"
                    && notification.listMember
                    && notification.listMember.status === "pending" && (
                    <ListInvitationResponseButtons
                        listMember={notification.listMember}
                        setUser={setUser}
                        onResponded={() => onMarkRead?.(notification.id)}
                    />
                )}
            </div>
        </div>
    )
}

function SkeletonRows({ count = 4 }: { count?: number }) {
    return (
        <div className="flex flex-col">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-4 px-6 py-4 items-start border-b border-white/5 last:border-b-0 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2 pt-1">
                        <div className="h-3 bg-white/10 rounded w-2/5" />
                        <div className="h-3 bg-white/5 rounded w-3/5" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function NotificationsPage({ setUser, user }: { setUser: (user: User | null) => void; user: User | null }) {
    const navigate = useNavigate()

    const [unread, setUnread] = useState<NotificationData[]>([])
    const [unreadCursor, setUnreadCursor] = useState<string | null>(null)
    const [unreadHasNext, setUnreadHasNext] = useState<boolean>(false)
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [loadCountUnread, setLoadCountUnread] = useState(0)

    const [read, setRead] = useState<NotificationData[]>([])
    const [readCursor, setReadCursor] = useState<string | null>(null)
    const [readHasNext, setReadHasNext] = useState<boolean>(false)
    const [readCount, setReadCount] = useState<number>(0)
    const [loadCountRead, setLoadCountRead] = useState(0)

    const [showRead, setShowRead] = useState<boolean>(false)
    const [filter, setFilter] = useState<ObtainNotificationFilterEnum>("all")

    const [obtainNotifications, { loading, error }] = useLazyQuery<ObtainNotificationsResponse, ObtainNotificationsInput>(OBTAIN_NOTIFICATIONS_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [readNotifications] = useMutation<ReadNotificationsResponse, ReadNotificationsInput>(READ_NOTIFICATIONS_MUTATION)

    // Initial fetch: both buckets. Re-runs whenever the filter changes, clearing
    // any rows from the previous filter so the page renders a clean filtered set.
    useEffect(() => {
        setUnread([])
        setUnreadCursor(null)
        setUnreadHasNext(false)
        setUnreadCount(0)
        setLoadCountUnread(0)
        setRead([])
        setReadCursor(null)
        setReadHasNext(false)
        setReadCount(0)
        setLoadCountRead(0)
        obtainNotificationsData(
            null, PAGE_SIZE,
            null, PAGE_SIZE,
            setUnread, setUnreadCursor, setUnreadHasNext, setUnreadCount,
            setRead, setReadCursor, setReadHasNext, setReadCount,
            filter,
            obtainNotifications, navigate, setUser,
        )
    }, [filter])

    // Paginate unread only
    useEffect(() => {
        if (loadCountUnread === 0) return
        obtainNotificationsData(
            unreadCursor, PAGE_SIZE,
            null, 0,
            setUnread, setUnreadCursor, setUnreadHasNext, setUnreadCount,
            setRead, setReadCursor, setReadHasNext, setReadCount,
            filter,
            obtainNotifications, navigate, setUser,
        )
    }, [loadCountUnread])

    // Paginate read only
    useEffect(() => {
        if (loadCountRead === 0) return
        obtainNotificationsData(
            null, 0,
            readCursor, PAGE_SIZE,
            setUnread, setUnreadCursor, setUnreadHasNext, setUnreadCount,
            setRead, setReadCursor, setReadHasNext, setReadCount,
            filter,
            obtainNotifications, navigate, setUser,
        )
    }, [loadCountRead])

    // Mark-as-read happens once on unmount, with whatever unread IDs were loaded
    // during the session. Doing it mid-session would shift the server's underlying
    // unread/read relations and invalidate the offset-based pagination cursors,
    // which causes items to be skipped or duplicated across buckets.
    // IDs to mark-as-read on unmount. Seeded with non-actionable unread rows as
    // they load; actionable rows (follow_request / followed with visible button)
    // get added only when the user clicks the corresponding button.
    const idsToMarkRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        unread.forEach(n => {
            if (!hasActionableButton(n, user)) {
                idsToMarkRef.current.add(n.id)
            }
        })
    }, [unread, user])

    function markNotificationRead(id: string) {
        idsToMarkRef.current.add(id)
    }

    useEffect(() => {
        return () => {
            const ids = Array.from(idsToMarkRef.current)
            if (ids.length > 0) {
                readNotificationsData(ids, readNotifications, navigate, setUser)
            }
        }
    }, [])

    const [unreadContainer, setUnreadContainer] = useState<HTMLDivElement | null>(null)
    const [readContainer, setReadContainer] = useState<HTMLDivElement | null>(null)

    const unreadSentinelRef = useInfiniteScroll({
        hasNextPage: unreadHasNext,
        loading,
        onLoadMore: () => setLoadCountUnread(c => c + 1),
        root: unreadContainer,
    })
    const readSentinelRef = useInfiniteScroll({
        hasNextPage: readHasNext,
        loading,
        onLoadMore: () => setLoadCountRead(c => c + 1),
        root: readContainer,
    })

    const initialLoading = loading && unread.length === 0 && read.length === 0

    return (
        <main className="max-w-3xl mx-auto grid grid-cols-[1fr_9rem] gap-6 items-start">
            <div className="flex flex-col gap-6 min-w-0">
            <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">Your recent activity and updates</p>
            </div>

            {error && <p className="text-red-400 text-sm">{error.message}</p>}

            <section>
                <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-sm font-semibold text-white">
                        Unread <span className="text-gray-500 font-normal">({unreadCount})</span>
                    </h2>
                </div>
                <div
                    ref={setUnreadContainer}
                    className="bg-[#171519] rounded-2xl border border-white/5 overflow-y-auto max-h-[55vh]"
                >
                    {initialLoading ? (
                        <SkeletonRows count={4} />
                    ) : unread.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <svg className="w-9 h-9 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <p className="text-gray-500 text-sm">You're all caught up</p>
                        </div>
                    ) : (
                        <>
                            {unread.map(n => (
                                <NotificationRow key={n.id} notification={n} navigate={navigate} user={user} setUser={setUser} showActions={true} onMarkRead={markNotificationRead} />
                            ))}
                            {unreadHasNext && <div ref={unreadSentinelRef} className="h-1" />}
                        </>
                    )}
                </div>
            </section>

            <section>
                <button
                    onClick={() => setShowRead(s => !s)}
                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-white px-1 hover:text-violet-300 transition"
                >
                    <span>
                        Read notifications <span className="text-gray-500 font-normal">({readCount})</span>
                    </span>
                    <span className="text-gray-500">{showRead ? "▾" : "▸"}</span>
                </button>

                {showRead && (
                    <div
                        ref={setReadContainer}
                        className="bg-[#171519] rounded-2xl border border-white/5 overflow-y-auto max-h-[55vh] mt-2"
                    >
                        {read.length === 0 && !loading ? (
                            <p className="text-gray-500 text-sm text-center py-8">No read notifications yet.</p>
                        ) : (
                            <>
                                {read.map(n => (
                                    <NotificationRow key={n.id} notification={n} navigate={navigate} user={user} setUser={setUser} showActions={false} />
                                ))}
                                {readHasNext && <div ref={readSentinelRef} className="h-1" />}
                            </>
                        )}
                    </div>
                )}
            </section>
            </div>

            <aside className="sticky top-6 flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Filter</span>
                {FILTERS.map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition">
                        <input
                            type="radio"
                            name="notif-filter"
                            value={value}
                            checked={filter === value}
                            onChange={() => setFilter(value)}
                            className="accent-violet-500"
                        />
                        {label}
                    </label>
                ))}
            </aside>
        </main>
    )
}

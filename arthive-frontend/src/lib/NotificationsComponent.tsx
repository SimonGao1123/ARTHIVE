import { useMutation } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { useInfiniteScroll } from "./useInfiniteScroll"
import { readNotificationsData } from "../data/read_notifications"
import type { Notification as NotificationData, ReadNotificationsResponse, ReadNotificationsInput } from "../types/mutations/read_notifications_mutation"
import { READ_NOTIFICATIONS_MUTATION } from "../types/mutations/read_notifications_mutation"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"

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

type NotifRow = {
    label: string
    title: string
    subtitle?: string
    onClick: () => void
}

function resolveNotification(n: NotificationData, navigate: (path: string) => void, onClose: () => void): NotifRow {
    const go = (path: string) => { navigate(path); onClose() }
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
        default:
            return { label: n.action, title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
    }
}

function NotificationCard({ notification, navigate, onClose }: { notification: NotificationData; navigate: (p: string) => void; onClose: () => void }) {
    const { label, title, subtitle, onClick } = resolveNotification(notification, navigate, onClose)
    return (
        <div
            onClick={onClick}
            className="flex gap-3 px-4 py-3 items-start hover:bg-white/[0.02] transition cursor-pointer"
        >
            <img
                src={notification.sender?.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                alt={notification.sender?.username}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-violet-400 font-medium leading-snug">{label}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-sm text-white leading-snug truncate">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{subtitle}</p>
                )}
            </div>
        </div>
    )
}

export default function NotificationsComponent({ setUser, onClose }: { setUser: (user: User | null) => void; onClose: () => void }) {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadCount, setLoadCount] = useState(0)
    const [readNotifications, { error, loading }] = useMutation<ReadNotificationsResponse, ReadNotificationsInput>(READ_NOTIFICATIONS_MUTATION)

    useEffect(() => {
        readNotificationsData(cursor, 10, setNotifications as any, setCursor, setHasNextPage, readNotifications, navigate, setUser)
    }, [loadCount])

    const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setLoadCount(c => c + 1),
        root: scrollContainer,
    })

    return (
        <div className="flex flex-col bg-[#171519] border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden w-80 max-h-[480px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl leading-none">×</button>
            </div>

            <div ref={setScrollContainer} className="overflow-y-auto scrollbar-hide flex-1">
                {error && <p className="text-red-400 text-xs px-4 py-3">{error.message}</p>}
                {loading && (
                    <div className="flex flex-col divide-y divide-white/5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-3 px-4 py-3 items-start animate-pulse">
                                <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                                    <div className="h-2.5 bg-white/10 rounded w-1/2" />
                                    <div className="h-2.5 bg-white/5 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && notifications.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">No new notifications.</p>
                )}
                <div className="flex flex-col divide-y divide-white/5">
                    {notifications.map(n => (
                        <NotificationCard key={n.id} notification={n} navigate={navigate} onClose={onClose} />
                    ))}
                </div>
                {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    )
}

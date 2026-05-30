import { useMutation } from "@apollo/client/react"
import { useEffect, useState } from "react"
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
        default:
            return { label: n.action, title: sender, onClick: () => go(`/profile/${n.sender?.id}`) }
    }
}

function NotificationRow({ notification, navigate }: { notification: NotificationData; navigate: (p: string) => void }) {
    const { label, title, subtitle, onClick } = resolveNotification(notification, navigate)
    return (
        <div
            onClick={onClick}
            className="flex gap-4 px-6 py-4 items-start hover:bg-white/[0.03] transition cursor-pointer border-b border-white/5 last:border-b-0"
        >
            <img
                src={notification.sender?.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                alt={notification.sender?.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-white/10"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-violet-400 font-medium leading-snug">{label}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-base text-white leading-snug truncate">{title}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{subtitle}</p>
                )}
            </div>
        </div>
    )
}

export default function NotificationsPage({ setUser }: { setUser: (user: User | null) => void; user: User | null }) {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadCount, setLoadCount] = useState(0)
    const [readNotifications, { error, loading }] = useMutation<ReadNotificationsResponse, ReadNotificationsInput>(READ_NOTIFICATIONS_MUTATION)

    useEffect(() => {
        readNotificationsData(cursor, 20, setNotifications as any, setCursor, setHasNextPage, readNotifications, navigate, setUser)
    }, [loadCount])

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">Your recent activity and updates</p>
            </div>

            <div className="bg-[#171519] rounded-2xl border border-white/5 overflow-hidden">
                {error && <p className="text-red-400 text-sm px-6 py-4">{error.message}</p>}

                {loading && (
                    <div className="flex flex-col">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex gap-4 px-6 py-4 items-start border-b border-white/5 last:border-b-0 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-2 pt-1">
                                    <div className="h-3 bg-white/10 rounded w-2/5" />
                                    <div className="h-3 bg-white/5 rounded w-3/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <svg className="w-10 h-10 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                )}

                {notifications.map(n => (
                    <NotificationRow key={n.id} notification={n} navigate={navigate} />
                ))}

                {hasNextPage && (
                    <button
                        onClick={() => setLoadCount(c => c + 1)}
                        className="w-full py-4 text-sm text-gray-500 hover:text-white hover:bg-white/[0.03] transition border-t border-white/5"
                    >
                        Load more
                    </button>
                )}
            </div>
        </div>
    )
}

import type { Dispatch, SetStateAction } from "react"
import type { User } from "@/types/domain/user"
import type { Notification, ObtainNotificationFilterEnum } from "@/types/queries/shared_queries_types"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function obtainNotificationsData(
    afterUnread: string | null,
    firstUnread: number,
    afterRead: string | null,
    firstRead: number,
    setUnread: Dispatch<SetStateAction<Notification[]>>,
    setUnreadCursor: (c: string | null) => void,
    setUnreadHasNext: (b: boolean) => void,
    setUnreadCount: (n: number) => void,
    setRead: Dispatch<SetStateAction<Notification[]>>,
    setReadCursor: (c: string | null) => void,
    setReadHasNext: (b: boolean) => void,
    setReadCount: (n: number) => void,
    filter: ObtainNotificationFilterEnum,
    obtainNotifications: any,
    navigate: any,
    setUser: (user: User | null) => void,
) {
    obtainNotifications({
        variables: {
            after_unread: afterUnread,
            first_unread: firstUnread,
            after_read: afterRead,
            first_read: firstRead,
            filter,
        }
    })
    .then((res: any) => {
        const payload = res?.data?.obtainNotifications
        if (!payload) return

        setUnreadCount(payload.unreadNotificationsCount)
        setReadCount(payload.readNotificationsCount)

        if (firstUnread > 0) {
            const unreadNodes: Notification[] = payload.unreadNotifications.edges.map((e: any) => e.node)
            setUnread(prev => {
                const seen = new Set(prev.map(n => n.id))
                return [...prev, ...unreadNodes.filter(n => !seen.has(n.id))]
            })
            setUnreadCursor(payload.unreadNotifications.pageInfo.endCursor)
            setUnreadHasNext(payload.unreadNotifications.pageInfo.hasNextPage)
        }

        if (firstRead > 0) {
            const readNodes: Notification[] = payload.readNotifications.edges.map((e: any) => e.node)
            setRead(prev => {
                const seen = new Set(prev.map(n => n.id))
                return [...prev, ...readNodes.filter(n => !seen.has(n.id))]
            })
            setReadCursor(payload.readNotifications.pageInfo.endCursor)
            setReadHasNext(payload.readNotifications.pageInfo.hasNextPage)
        }
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}

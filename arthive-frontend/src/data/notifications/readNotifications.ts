import type { User } from "@/types/domain/user"
import { logout } from "@/data/auth/logout"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function readNotificationsData(
    notificationIds: string[],
    readNotifications: any,
    navigate: any,
    setUser: (user: User | null) => void,
    onMarked?: (markedIds: string[]) => void,
) {
    if (notificationIds.length === 0) return

    readNotifications({
        variables: {
            input: { notificationIds }
        }
    })
    .then((res: any) => {
        const marked: string[] = res?.data?.readNotifications ?? []
        onMarked?.(marked)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}

import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"


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
        handleMutationUnauth(error, setUser, navigate)
    })
}

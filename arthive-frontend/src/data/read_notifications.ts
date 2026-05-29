import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function readNotificationsData(
    after: string | null,
    first: number,
    setNotifications: Dispatch<SetStateAction<Notification[]>>,
    setCursor: Dispatch<SetStateAction<string | null>>,
    setHasNextPage: Dispatch<SetStateAction<boolean>>,
    readNotifications: any,
    navigate: any,
    setUser: (user: User | null) => void,
) {
    readNotifications({
        variables: {
            after: after,
            first: first
        }
    })
    .then((data: any) => {
        const notifications = data.data.readNotifications.edges.map((edge: any) => edge.node)
        setNotifications(prev => {
            const existingIds = new Set(prev.map((n: any) => n.id))
            return [...prev, ...notifications.filter((n: any) => !existingIds.has(n.id))]
        })
        setCursor(data.data.readNotifications.pageInfo.endCursor)
        setHasNextPage(data.data.readNotifications.pageInfo.hasNextPage)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
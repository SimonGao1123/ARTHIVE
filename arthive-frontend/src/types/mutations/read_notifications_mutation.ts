import { gql } from "@apollo/client"

export const READ_NOTIFICATIONS_MUTATION = gql`
    mutation ReadNotifications($input: ReadNotificationsInput!) {
        readNotifications(input: $input)
    }
`

export type ReadNotificationsInput = {
    input: {
        notificationIds: string[]
    }
}

export type ReadNotificationsResponse = {
    readNotifications: string[]
}

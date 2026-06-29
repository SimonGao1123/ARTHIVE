export type RemoveAttachedImageInput = {
    input: {
        signedIds: string[]
        resourceId: number
        resourceType: "review" | "user" | "media"
    }
}

export type RemoveAttachedImageResponse = {
    removeAttachedImage: boolean
}

export type ReadNotificationsInput = {
    input: {
        notificationIds: string[]
    }
}

export type ReadNotificationsResponse = {
    readNotifications: string[]
}

export type UploadImageToS3Input = {
    signedIds: string[]
    resourceId: string | number
    resourceType: string
}

export type UploadImageToS3Response = {
    attachS3Image: {
        success: boolean
    }
}

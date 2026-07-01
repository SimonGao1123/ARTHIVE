// PossibleResourceImageTypesEnum from the backend covers 4 values.
type ResourceImageType = "media" | "user" | "review" | "community_thread"

export type RemoveAttachedImageInput = {
    input: {
        signedIds: string[]
        resourceId: number
        resourceType: ResourceImageType
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

// Backend Mutations::ReadNotifications returns [ID!]! — the array of IDs
// that were marked read. The mutation document uses no selection set which
// is valid for a scalar list return.
export type ReadNotificationsResponse = {
    readNotifications: string[]
}

// UPLOAD_IMAGE_TO_S3_MUTATION declares flat variables at the top level and
// re-wraps them into an input object inside the mutation body — the TS
// Input therefore matches the flat variable shape.
export type UploadImageToS3Input = {
    signedIds: string[]
    resourceId: string | number
    resourceType: ResourceImageType
}

export type UploadImageToS3Response = {
    attachS3Image: {
        success: boolean
    }
}

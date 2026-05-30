export function removeAttachedImageFunction(removeAttachedImage: any, signedIds: string[], resourceId: number, resourceType: "review" | "user" | "media" | "community_thread") {
    removeAttachedImage({variables: {input: {signedIds, resourceId, resourceType}}})
}
export function removeAttachedImageFunction(removeAttachedImage: any, signedIds: string[], resourceId: number, resourceType: "review" | "user" | "media") {
    removeAttachedImage({variables: {input: {signedIds, resourceId, resourceType}}})
    .then((data: any) => {
        console.log(data)
    })
    .catch((error: any) => {
        console.log(error)
    })
}
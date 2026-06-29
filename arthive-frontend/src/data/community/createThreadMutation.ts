import type { Dispatch, SetStateAction } from "react";
import type { CommunityThread } from "@/types/queries/thread_queries_types";
import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { NavigateFunction } from "react-router-dom";
import { uploadMultipleFilesToS3 } from "@/data/media/uploadFileToS3";

export function createThreadMutation(
    createThread: any,
    communityId: string,
    content: string,
    title: string | null,
    parentThreadId: string | null,
    rootThreadId: string | null,
    setUser: (user: User | null) => void,
    navigate: NavigateFunction,
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>,
    newImages: {file: File, url: string, uuid: string}[],
    uploadImageToS3: any,
    reviewId: string | null,
    onCreated?: () => void
) {
    createThread({
        variables: {
            input: {
                communityId: communityId,
                content: content,
                title: title,
                parentThreadId: parentThreadId,
                rootThreadId: rootThreadId,
                reviewId: reviewId
            }
        }
    }).then(async (data: any) => {
        const created = data.data.createThread
        setThreads(prev => [created, ...prev.filter((thread: any) => thread.id !== created.id)])
        onCreated?.()
        if (newImages.length > 0) {
            setThreads(prev => {
                prev.find(thread => thread.id === data.data.createThread.id)!.imageDetails = newImages.map((image) => ({signedId: image.uuid, url: image.url}))
                return prev
            })
            const signedIds = await uploadMultipleFilesToS3(newImages.map((image) => image.file))
            if (!signedIds) {
                alert("Error uploading images to S3")
                return
            }
            const attachResults = await uploadImageToS3({variables: {signedIds, resourceId: data.data.createThread.id, resourceType: "community_thread"}})
            if (!attachResults.data?.attachS3Image?.success) {
                alert("Error attaching images to thread")
                return
            }
        }
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate)

    })
}
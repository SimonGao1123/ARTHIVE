import type { Dispatch, SetStateAction } from "react";
import type { CommunityThread } from "../types/queries/community_request_queries";
import type { User } from "../types/user_types";
import { logout } from "./logout";
import type { NavigateFunction } from "react-router-dom";
import { uploadMultipleFilesToS3 } from "./upload_file_to_s3";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
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
            const jwt = localStorage.getItem("authToken")
            if (!jwt) {
                logout(setUser, navigate)
                return
            }
            const signedIds = await uploadMultipleFilesToS3(newImages.map((image) => image.file), jwt)
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
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}
import type { User } from "../types/user_types"
import { logout } from "./logout"
import { uploadMultipleFilesToS3 } from "./upload_file_to_s3"
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]
export function editCommunityThread (
    threadId: string,
    content: string,
    title: string | null,
    reviewId: string | null,
    deleteThread: boolean,
    editCommunityThread: any,
    setUser: (user: User | null) => void,
    navigate: any,
    uploadImageToS3: any,
    newImages: {file: File, url: string, uuid: string}[],
) {
    if (content === "") {
        alert("Content is required")
        return
    }
    
    editCommunityThread({variables: {input: {
        threadId, 
        content, 
        title: title === "" ? null : title, 
        reviewId: reviewId === null ? null : reviewId, 
        deleteThread}}})
    .then(async (data: any) => {
        if (newImages.length > 0 && deleteThread === false && content) {
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
            const attachResults = await uploadImageToS3({variables: {signedIds, resourceId: data.data.editThread.id, resourceType: "community_thread"}})
            if (!attachResults.data?.attachS3Image?.success) {
                alert("Error attaching images to thread")
                return
            }
        }
        window.location.reload()

    })
    .catch((error: any) => {
        console.error("Error: ", error)
        if (error.message && unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
            return
        }
        alert(error.message)
    })
}
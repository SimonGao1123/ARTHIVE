import type { User } from "@/types/domain/user"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { uploadMultipleFilesToS3 } from "@/data/media/uploadFileToS3"
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
            const signedIds = await uploadMultipleFilesToS3(newImages.map((image) => image.file))
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
        if (handleMutationUnauth(error, setUser, navigate)) return
        alert(error.message)
    })
}
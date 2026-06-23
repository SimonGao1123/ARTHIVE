import { logout } from "@/data/auth/logout"
import { uploadFileToS3 } from "@/data/media/uploadFileToS3"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]


export async function mediaUpload(mediaData: any, setUser: any, navigate: any, createMedia: any, uploadImageToS3: any) {
    if (!mediaData.title) {
        alert("Title is required")
        return
    }
    if (!mediaData.creator) {
        alert("Creator is required")
        return
    }
    if (!mediaData.year) {
        alert("Year is required")
        return
    }
    if (!mediaData.content_type) {
        alert("Content Type is required")
        return
    }
    if (!mediaData.language) {
        alert("Language is required")
        return
    }
    if (!mediaData.summary) {
        alert("Summary is required")
        return
    }
    if (mediaData.genre.length === 0) {
        alert("At least one genre is required")
        return
    }

    if (!mediaData.cover_image) {
        alert("Cover Image is required")
        return
    }

    

    createMedia({variables: {
        title: mediaData.title,
        creator: mediaData.creator,
        year: mediaData.year,
        contentType: mediaData.content_type,
        language: mediaData.language,
        summary: mediaData.summary,
        genre: mediaData.genre,
        ongoing: mediaData.ongoing,
        actors: mediaData.actors,
        pageCount: Number(mediaData.page_count),
        seriesTitle: mediaData.series_title,
        organization: mediaData.organization,
    }}).then(async(data: any) => {
        if (data.data.createMedia.id) {
            const jwt = localStorage.getItem("authToken")
            if (!jwt) {
                logout(setUser, navigate)
                return
            }
            
            
            const signedId = await uploadFileToS3(mediaData.cover_image, jwt);
            if (!signedId) {
                alert("Error uploading cover image to S3")
                return
            }

            // ensures that the image is uploaded to database before s3 image attached
            // avoids orphaned images in s3 bucket
            const attachResult = await uploadImageToS3({variables: {signedIds: [signedId], resourceId: data.data.createMedia.id, resourceType: "media"}})
            if (!attachResult.data?.attachS3Image?.success) {
                alert("Error attaching cover image")
                return
            }
            alert("Media uploaded successfully")
        }
    }).catch((error: { message?: string }) => {
        if (error.message && unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            alert("Error creating media")
        }
    })
}
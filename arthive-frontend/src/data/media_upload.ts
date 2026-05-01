import { logout } from "./logout"
import { uploadFileToS3 } from "./upload_file_to_s3"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]


export async function mediaUpload(mediaData: any, setUser: any, navigate: any, createMedia: any) {
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
        coverImage: signedId,
    }}).then((data: unknown) => {
        console.log("Media created: ", data)
    }).catch((error: { message?: string }) => {
        console.error("Error: ", error)
        if (error.message && unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            alert("Error creating media")
        }
    })
}
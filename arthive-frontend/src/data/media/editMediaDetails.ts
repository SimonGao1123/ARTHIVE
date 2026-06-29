import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { uploadFileToS3 } from "./uploadFileToS3"

export function editMediaDetails(
    mediaData: any,
    setUser: any,
    navigate: any,
    editMedia: any,
    uploadImageToS3: any,
) {
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

    return editMedia({variables:{
        mediaId: mediaData.media_id,
        title: mediaData.title,
        creator: mediaData.creator,
        year: mediaData.year,
        contentType: mediaData.content_type,
        language: mediaData.language,
        summary: mediaData.summary,
        genre: mediaData.genre,
        ongoing: mediaData.ongoing,
        actors: mediaData.content_type === "book" ? null : mediaData.actors,
        pageCount: mediaData.content_type === "book" ? mediaData.page_count : null,
        seriesTitle: mediaData.series_title,
        organization: mediaData.organization,
        ifDeleted: mediaData.if_deleted,
    }}).then(async (res: any) => {
        if (!res.data.editMedia) {
            alert("Deleted media")
            return
        }
        if (mediaData.cover_image) {
            const signedId = await uploadFileToS3(mediaData.cover_image);
            if (!signedId) {
                alert("Error uploading cover image to S3")
                return
            }
            const attachResult = await uploadImageToS3({variables: {signedIds: [signedId], resourceId: res.data.editMedia.id, resourceType: "media"}})
            if (!attachResult.data?.attachS3Image?.success) {
                alert("Error attaching cover image")
                return
            }
        }
        alert("Media details updated successfully")
    }).catch((err: any) => {
        if (handleMutationUnauth(err, setUser, navigate)) return
        alert("Failed to update media details")
    })
    
}
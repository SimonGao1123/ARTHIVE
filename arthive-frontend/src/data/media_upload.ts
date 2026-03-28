import { logout } from "./logout"
export function mediaUpload(mediaData: any, setUser: any, navigate: any) {
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

    console.log("Media Data: ", mediaData)
    const formData = new FormData()
    formData.append("title", mediaData.title)
    formData.append("creator", mediaData.creator)
    formData.append("year", mediaData.year)
    formData.append("content_type", mediaData.content_type)
    formData.append("language", mediaData.language)
    formData.append("summary", mediaData.summary)
    for (const g of mediaData.genre) {
        formData.append("genre[]", g)
    }
    formData.append("ongoing", mediaData.ongoing)
    for (const a of mediaData.actors) {
        formData.append("actors[]", a)
    }
    if (mediaData.page_count != null) {
        formData.append("page_count", String(mediaData.page_count))
    }
    if (mediaData.series_title != null) {
        formData.append("series_title", mediaData.series_title)
    }
    if (mediaData.organization != null) {
        formData.append("organization", mediaData.organization)
    }
    formData.append("cover_image", mediaData.cover_image)

    fetch("http://localhost:3000/upload_media", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
    }).then(response => response.json()).then(data => {
        if (data.error && data.error.includes("UNAUTHENTICATED")) {
            logout(setUser, navigate)
        } else if (data.error) {
            alert(data.error)
        } else {
            console.log(data.media)
            console.log(data.cover_image)
            
        }
        console.log(data.message)
    }).catch(error => {
        console.error("Error: ", error)
    })
}
type HandleAttachImagesProps = {
    files: File[]
    newImages: {file: File, url: string, uuid: string}[]
    setNewImages: React.Dispatch<React.SetStateAction<{file: File, url: string, uuid: string}[]>>
}
export function handleAttachImages({files, newImages, setNewImages}: HandleAttachImagesProps) {
    for (const file of files) {
        if (newImages.length >= 5) return
        if (file.type.split("/")[0] !== "image") continue
        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large (max 2MB)")
            continue
        }
        const url = URL.createObjectURL(file)
        const uuid = crypto.randomUUID()
        setNewImages((prev) => [...prev, {file, url, uuid}])
    }
}
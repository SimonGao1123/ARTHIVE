import { TrashIcon } from "./StyledComponents"
import { useMutation } from "@apollo/client/react"
import { REMOVE_ATTACHED_IMAGE_MUTATION } from "@/apollo/mutations/shared_mutations"
import type { RemoveAttachedImageInput, RemoveAttachedImageResponse } from "@/types/mutations/shared_mutations_types"
import { removeAttachedImageFunction } from "@/data/media/removeImageAttachment"

type PreviewImageDisplayProps = {
    newImages: {file: File, url: string, uuid: string}[]
    setNewImages: React.Dispatch<React.SetStateAction<{file: File, url: string, uuid: string}[]>>
    existingImages: {signedId: string, url: string}[]
    setExistingImages: React.Dispatch<React.SetStateAction<{signedId: string, url: string}[]>>
    resourceId: number | null
    resourceType: "review" | "community_thread"
}
export default function PreviewImageDisplay ({newImages, setNewImages, existingImages, setExistingImages, resourceId, resourceType}: PreviewImageDisplayProps) {
    const [removeAttachedImage] = useMutation<RemoveAttachedImageResponse, RemoveAttachedImageInput>(REMOVE_ATTACHED_IMAGE_MUTATION)
    return (
        <div className="flex gap-2">
            {newImages.map((image) => (
                <div key={image.uuid}>
                    <img src={image.url} alt={image.file.name} className="w-24 h-auto rounded-lg object-cover flex-shrink-0"/>
                    <button onClick={() => setNewImages((prev) => prev.filter((prevImage) => prevImage.uuid !== image.uuid))} className="text-gray-400 hover:text-white text-2xl leading-none transition">
                        <TrashIcon />
                    </button>
                </div>
            ))}
            {resourceId && existingImages.map((image) => (
                <div key={image.signedId}>
                    <img src={image.url} alt={image.signedId} className="w-24 h-auto rounded-lg object-cover flex-shrink-0"/>
                    <button onClick={() => {
                        removeAttachedImageFunction(removeAttachedImage, [image.signedId], resourceId, resourceType)
                        setExistingImages((prev) => prev.filter((prevImage) => prevImage.signedId !== image.signedId))} 
                        } className="text-gray-400 hover:text-white text-2xl leading-none transition">

                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>
    )
}
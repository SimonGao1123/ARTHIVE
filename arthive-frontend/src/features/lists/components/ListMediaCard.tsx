import type { Media } from "@/types/domain/media"
import type { Dispatch, SetStateAction } from "react"
import { DetailedMediaCard } from "@/features/media/components/DetailedMediaCard"
import { TrashIcon } from "@/shared/components/StyledComponents"

export default function ListMediaCard({ media_data, setRemoveMediaId, setMediaInLists, canRemove }: { media_data: Media, setRemoveMediaId: Dispatch<SetStateAction<string>>, setMediaInLists: Dispatch<SetStateAction<Media[]>>, canRemove: boolean }) {
    return (
        <div className="relative group">
            <DetailedMediaCard media={media_data} />
            <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            {canRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setRemoveMediaId(media_data.id.toString())
                        setMediaInLists((prev: Media[]) => prev.filter((m) => m.id !== media_data.id))
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/20"
                    title="Remove from list"
                >
                    <TrashIcon />
                </button>
            )}
        </div>
    )
}

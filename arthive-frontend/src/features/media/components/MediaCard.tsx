import { useNavigate } from "react-router-dom"
import { contentTypeColor } from "@/shared/utils/contentTypeColors"
import DisplayRating from "@/features/reviews/components/DisplayRating"
import type { MediaCardData } from "@/types/common"

export type { MediaCardData }

export function MediaCard({media}: {media: MediaCardData}) {
    const navigate = useNavigate()
    const borderColor = contentTypeColor(media.contentType)

    return (
        <button
            onClick={() => navigate(`/media/${media.id}`)}
            className="group relative rounded-xl overflow-hidden focus:outline-none w-full"
            style={{ boxShadow: `0 0 0 2px ${borderColor}` }}
        >
            <img
                src={media.coverImage}
                alt={`Cover for media ${media.id}`}
                className="w-full aspect-[2/3] object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

            {(media.ifFavorite || media.ifFinished) && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {media.ifFinished && (
                        <span className="flex items-center justify-center text-emerald-200 bg-emerald-600/80 border border-emerald-400/60 p-1 rounded-full shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </span>
                    )}
                    {media.ifFavorite && (
                        <span className="flex items-center justify-center text-pink-100 bg-pink-600/80 border border-pink-400/60 p-1 rounded-full shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </span>
                    )}
                </div>
            )}

            {media.averageRating > 0 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1.5 pt-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DisplayRating rating={media.averageRating} size="sm" />
                </div>
            )}
        </button>
    )
}

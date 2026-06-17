import { useNavigate } from "react-router-dom"
import { contentTypeColor } from "./contentTypeColors"
import type { Media } from "../types/media_type"
export function DetailedMediaCard({ media} : { media: Media }) {
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/media/${media.id}`)}
            className="group cursor-pointer flex flex-col gap-1.5"
        >
            <div className="relative overflow-hidden rounded-lg">
                <img
                    src={media.coverImage ?? "/default-ARTHIVE-pfp.png"}
                    alt={media.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    style={{ border: `2px solid ${contentTypeColor(media.contentType)}` }}
                />
                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {(media.ifFinished || media.ifFavorite) && (
                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
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
            </div>
            <p className="text-xs text-white font-medium leading-tight line-clamp-2">{media.title}</p>
            <p className="text-xs text-gray-500">{media.creator} {media.year ? `(${media.year})` : ""}</p>
        </div>
    )
}
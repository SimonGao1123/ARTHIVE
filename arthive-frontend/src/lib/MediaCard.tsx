import { useNavigate } from "react-router-dom"

export function MediaCard({media}: {media: {id: number, coverImage: string}}) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(`/media/${media.id}`)}
            className="flex-shrink-0 w-32 group relative rounded-xl overflow-hidden focus:outline-none"
        >
            <img
                src={media.coverImage}
                alt={`Cover for media ${media.id}`}
                className="w-32 h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </button>
    )
}

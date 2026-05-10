import { useNavigate } from "react-router-dom"

export function MediaCard ({media} : {media: {id: number, coverImage: string}}) {
    const navigate = useNavigate()
    return (
        <img onClick={() => navigate(`/media/${media.id}`)} height={250} width={200} src={media.coverImage} alt={`Cover image for media ${media.id}`} />
    )
    
}
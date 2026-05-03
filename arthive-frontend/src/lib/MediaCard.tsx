import { useNavigate } from "react-router-dom"

export function MediaCard ({media, prev_page} : {media: {id: number, coverImage: string}, prev_page: string}) {
    const navigate = useNavigate()
    return (
        <img onClick={() => navigate(`/media/${prev_page}/${media.id}`)} height={250} width={200} src={media.coverImage} alt={`Cover image for media ${media.id}`} />
    )
    
}
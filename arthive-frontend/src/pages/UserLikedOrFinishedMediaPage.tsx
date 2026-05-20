import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import {
    OBTAIN_LIKED_OR_FINISHED_MEDIA_QUERY,
    type LikedOrFinishedMediaCard,
    type ObtainLikedOrFinishedMediaInput,
    type ObtainLikedOrFinishedMediaResponse,
} from "../types/queries/liked_or_finished_media_query"
import { obtainLikedOrFinishedMediaFunction } from "../data/obtain_liked_or_finished_media"
import ContentFilter from "../lib/ContentFilter"
import { NumberedPagination } from "../lib/NumberedPagination"

const LIMIT = 10

export default function UserLikedOrFinishedMediaPage({ type, setUser }: { type: "liked" | "finished"; setUser: (user: User | null) => void }) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    if (!user_id) {
        navigate("/")
        return
    }

    const [media, setMedia] = useState<LikedOrFinishedMediaCard[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")

    const [getMedia] = useLazyQuery<ObtainLikedOrFinishedMediaResponse, ObtainLikedOrFinishedMediaInput>(OBTAIN_LIKED_OR_FINISHED_MEDIA_QUERY)

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setMedia([])
        setPageNum(1)
        setContentType(nextContentType)
    }

    useEffect(() => {
        setMedia([])
        setPageNum(1)
        setQuery("")
        setCurrQuery("")
        setContentType("all")
    }, [type, user_id])

    useEffect(() => {
        obtainLikedOrFinishedMediaFunction(user_id, type, contentType, pageNum, LIMIT, query, setTotalPages, getMedia, setMedia, navigate, setUser)
    }, [type, user_id, contentType, pageNum, query])

    return (
        <div>
            <h1>{type === "liked" ? "Liked Media" : "Finished Media"}</h1>
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            <input type="text" placeholder="Search" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
            <button disabled={currQuery === query} onClick={() => setQuery(currQuery)}>Search</button>

            <div className="flex gap-2 flex-wrap">
                {media.map((m) => (
                    <div key={m.id} onClick={() => navigate(`/media/${m.id}`)} style={{ cursor: "pointer" }}>
                        <img width={120} height={180} src={m.coverImage ?? "/default-ARTHIVE-pfp.png"} alt={m.title} />
                        <div>{m.title}</div>
                        <div>{m.creator} ({m.year})</div>
                    </div>
                ))}
            </div>

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

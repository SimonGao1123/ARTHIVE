import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import {
    OBTAIN_LIKED_OR_FINISHED_MEDIA_QUERY,
    type ObtainLikedOrFinishedMediaInput,
    type ObtainLikedOrFinishedMediaResponse,
} from "../types/queries/liked_or_finished_media_query"
import { obtainLikedOrFinishedMediaFunction } from "../data/obtain_liked_or_finished_media"
import ContentFilter from "../lib/ContentFilter"
import { NumberedPagination } from "../lib/NumberedPagination"
import { DetailedMediaCard } from "../lib/DetailedMediaCard"
import type { Media } from "../types/media_type"
const LIMIT = 10

export default function UserLikedOrFinishedMediaPage({ type, setUser }: { type: "liked" | "finished"; setUser: (user: User | null) => void }) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    const [media, setMedia] = useState<Media[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [pageUser, setPageUser] = useState<{ id: string; username: string } | null>(null)

    const [getMedia] = useLazyQuery<ObtainLikedOrFinishedMediaResponse, ObtainLikedOrFinishedMediaInput>(OBTAIN_LIKED_OR_FINISHED_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) return
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
        if (!user_id) return
        obtainLikedOrFinishedMediaFunction(user_id, type, contentType, pageNum, LIMIT, query, setTotalPages, getMedia, setMedia, navigate, setUser, setPageUser)
    }, [type, user_id, contentType, pageNum, query])

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-white">
                {pageUser ? `${pageUser.username}'s ${type === "liked" ? "Liked Media" : "Logged Media"}` : (type === "liked" ? "Liked Media" : "Logged Media")}
            </h1>

            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search"
                    value={currQuery}
                    onChange={(e) => setCurrQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && currQuery !== query) setQuery(currQuery) }}
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
                <button
                    disabled={currQuery === query}
                    onClick={() => setQuery(currQuery)}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Search
                </button>
            </div>

            {media.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No media found.</p>
            ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" }}>
                    {media.map((media) => (
                        <DetailedMediaCard key={media.id} media={media} />
                    ))}
                </div>
            )}

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}


import { useEffect, useState } from "react"
import { useDataQuery } from "@/apollo/useDataQuery"
import { useNavigate, useParams } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { OBTAIN_FINISHED_MEDIA_QUERY } from "@/apollo/queries/media_queries"
import type { ObtainFinishedMediaInput, ObtainFinishedMediaResponse } from "@/types/queries/media_queries_types"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import ContentFilter from "@/shared/components/ContentFilter"
import { NumberedPagination } from "@/shared/components/NumberedPagination"
import { DetailedMediaCard } from "@/features/media/components/DetailedMediaCard"
import type { Media } from "@/types/domain/media"
import SignInPrompt from "@/shared/components/SignInPrompt"

const LIMIT = 10

export default function MyLoggedMediaPage({ setUser, user }: { setUser: (user: User | null) => void, user: User | null }) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    const [media, setMedia] = useState<Media[]>([])
    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [pageUser, setPageUser] = useState<{ id: string; username: string } | null>(null)

    const { data: finishedData, error: finishedError } = useDataQuery<ObtainFinishedMediaResponse, ObtainFinishedMediaInput>(
        OBTAIN_FINISHED_MEDIA_QUERY,
        {
            variables: {
                userId: user_id ?? "",
                contentType,
                pageNum,
                limit: LIMIT,
                query: query === "" ? null : query,
            },
            skip: !user_id || !user,
        }
    )

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    useEffect(() => {
        if (!finishedData?.obtainFinishedMedia) return
        const batch = finishedData.obtainFinishedMedia
        setMedia(batch.media)
        setTotalPages(batch.pageInfo.totalPages)
        setPageUser(batch.user)
    }, [finishedData])

    useEffect(() => {
        if (finishedError) handleMutationUnauth(finishedError, setUser, navigate)
    }, [finishedError])

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
    }, [user_id])

    if (!user) return <SignInPrompt title="Sign in to view logged media" message="Sign in to browse logged media." />

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-white">
                {pageUser ? `${pageUser.username}'s Logged Media` : "Logged Media"}
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
                    {media.map((m) => (
                        <DetailedMediaCard key={m.id} media={m} />
                    ))}
                </div>
            )}

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

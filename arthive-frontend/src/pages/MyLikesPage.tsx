import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import type { Media } from "../types/media_type"
import type { AllUserListType } from "../types/queries/lists_request_queries"
import {
    OBTAIN_LIKES_PAGE_QUERY,
    type LikedReview,
    type LikesType,
    type ObtainLikesPageInput,
    type ObtainLikesPageResponse,
} from "../types/queries/likes_page_query"
import { obtainLikesPageData } from "../data/obtain_likes_page_data"
import ContentFilter from "../lib/ContentFilter"
import TypeFilter from "../lib/TypeFilter"
import { NumberedPagination } from "../lib/NumberedPagination"
import { DetailedMediaCard } from "../lib/DetailedMediaCard"
import ReviewCard from "../lib/ReviewCard"
import ListCard from "../lib/ListCard"

const LIMIT = 10

type ContentType = "book" | "film" | "series" | "game" | "all"

export default function MyLikesPage({ setUser }: { setUser: (user: User | null) => void }) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    const [type, setType] = useState<LikesType>("media")
    const [contentType, setContentType] = useState<ContentType>("all")
    const [pageNum, setPageNum] = useState<number>(1)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [pageUser, setPageUser] = useState<{ id: string, username: string } | null>(null)

    const [media, setMedia] = useState<Media[]>([])
    const [reviews, setReviews] = useState<LikedReview[]>([])
    const [lists, setLists] = useState<AllUserListType[]>([])

    const [getLikes] = useLazyQuery<ObtainLikesPageResponse, ObtainLikesPageInput>(OBTAIN_LIKES_PAGE_QUERY, {
        fetchPolicy: "no-cache",
    })

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    const handleTypeChange = (next: LikesType) => {
        if (next === type) return
        setMedia([])
        setReviews([])
        setLists([])
        setPageNum(1)
        setType(next)
    }

    const handleContentTypeChange = (next: ContentType) => {
        if (next === contentType) return
        setMedia([])
        setReviews([])
        setLists([])
        setPageNum(1)
        setContentType(next)
    }

    useEffect(() => {
        setMedia([])
        setReviews([])
        setLists([])
        setPageNum(1)
        setQuery("")
        setCurrQuery("")
        setContentType("all")
        setType("media")
    }, [user_id])

    useEffect(() => {
        if (!user_id) return
        obtainLikesPageData(user_id, type, contentType, pageNum, LIMIT, query, getLikes, setMedia, setReviews, setLists, setTotalPages, setPageUser, navigate, setUser)
    }, [user_id, type, contentType, pageNum, query])

    const isEmpty = (type === "media" && media.length === 0)
        || (type === "reviews" && reviews.length === 0)
        || (type === "lists" && lists.length === 0)

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-white">
                {pageUser ? `${pageUser.username}'s Likes` : "Likes"}
            </h1>

            <TypeFilter currType={type} setType={handleTypeChange} />
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

            {isEmpty ? (
                <p className="text-gray-500 text-sm text-center py-8">No likes found.</p>
            ) : type === "media" ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" }}>
                    {media.map((m) => (
                        <DetailedMediaCard key={m.id} media={m} />
                    ))}
                </div>
            ) : type === "reviews" ? (
                <div className="flex flex-col">
                    {reviews.map((r) => (
                        <ReviewCard key={r.id} review={r} setUser={setUser} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {lists.map((l) => (
                        <div key={l.id} className="bg-[#171519] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                            <ListCard list={l} />
                        </div>
                    ))}
                </div>
            )}

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

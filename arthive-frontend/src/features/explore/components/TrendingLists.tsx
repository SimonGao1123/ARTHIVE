import { useDataQuery } from "@/apollo/useDataQuery"
import type { User } from "@/types/domain/user"
import { OBTAIN_TRENDING_LISTS_QUERY } from "@/apollo/queries/list_queries"
import type { ObtainTrendingListsResponse, ObtainTrendingListsInput, ListType } from "@/types/queries/list_queries_types"
import { useEffect, useState } from "react"
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import { useNavigate } from "react-router-dom"
import { HeartIcon } from "@/shared/components/StyledComponents"

type TrendingListsProps = {
    setUser: (user: User | null) => void
    currContentType: "book" | "film" | "series" | "game" | "all"
    limit: number
}
export default function TrendingLists({ setUser, currContentType, limit }: TrendingListsProps) {
    const navigate = useNavigate()
    const [page, setPage] = useState<{ 
        direction: "next" | "prev",
        cursor: string | null,
        contentType: typeof currContentType}>({ direction: "next", cursor: null, contentType: currContentType })
    const [slideDir, setSlideDir] = useState<"next" | "prev">("next")
    const [pageKey, setPageKey] = useState(0)

    if (currContentType !== page.contentType) { // changed content type
        setPage({ direction: "next", cursor: null, contentType: currContentType })
    }

    const { data, loading, error } = useDataQuery<ObtainTrendingListsResponse, ObtainTrendingListsInput>(
        OBTAIN_TRENDING_LISTS_QUERY,
        {
            variables: page.direction === "next"
                ? { contentType: page.contentType, after: page.cursor ?? undefined, first: limit }
                : { contentType: page.contentType, before: page.cursor ?? undefined, last: limit },
        }
    )

    useEffect(() => {
        if (error) handleMutationUnauth(error, setUser, navigate)
    }, [error])


    const allLists: ListType[] = data?.obtainTrendingLists.edges.map((e) => e.node) ?? []
    const ifNextPage = data?.obtainTrendingLists.pageInfo.hasNextPage ?? false
    const ifPrevPage = data?.obtainTrendingLists.pageInfo.hasPreviousPage ?? false
    const nextCursor = data?.obtainTrendingLists.pageInfo.endCursor ?? null
    const prevCursor = data?.obtainTrendingLists.pageInfo.startCursor ?? null

    function handleNav(goNext: boolean, cursor: string | null) {
        setSlideDir(goNext ? "next" : "prev")
        setPageKey(k => k + 1)
        setPage({ direction: goNext ? "next" : "prev", cursor, contentType: page.contentType })
    }

    return (
        <div className="relative group/carousel">
            {error && <div className="text-red-400 text-sm">{error.message}</div>}
            <div className="overflow-x-hidden overflow-y-visible py-1 px-1">
                <div
                    key={pageKey}
                    className={slideDir === "next" ? "slide-from-right" : "slide-from-left"}
                    style={{ display: "grid", gridTemplateColumns: `repeat(${limit}, 1fr)`, gap: "0.75rem" }}
                >
                    {loading
                        ? Array.from({length: limit}).map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
                        ))
                        : allLists.map((list) => <ListCard key={list.id} list={list} />)
                    }
                </div>
            </div>
            <button
                onClick={() => handleNav(false, prevCursor)}
                disabled={!ifPrevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl transition opacity-0 group-hover/carousel:opacity-100 disabled:hidden shadow-lg"
            >
                ‹
            </button>
            <button
                onClick={() => handleNav(true, nextCursor)}
                disabled={!ifNextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl transition opacity-0 group-hover/carousel:opacity-100 disabled:hidden shadow-lg"
            >
                ›
            </button>
        </div>
    )
}

function ListCard({list}: {list: ListType}) {
    const navigate = useNavigate()
    const covers = list.mediaInLists?.slice(0, 3) ?? []
    return (
        <button
            onClick={() => navigate(`/list/${list.id}`)}
            className="group flex flex-col gap-2 text-left rounded-xl bg-[#171519]/60 border border-white/5 hover:border-white/10 p-3 transition w-full focus:outline-none"
        >
            <div className="flex items-end h-24 pl-4">
                {covers.length > 0 ? covers.map((mil, i) => (
                    <img
                        key={mil.media.id}
                        src={mil.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                        alt=""
                        className="w-14 h-20 object-cover rounded-lg border-2 border-[#171519] shadow-md transition-transform duration-200 group-hover:-translate-y-0.5"
                        style={{ marginLeft: i === 0 ? 0 : '-1.25rem', zIndex: i + 1, position: 'relative' }}
                    />
                )) : (
                    <div className="w-14 h-20 rounded-lg bg-white/5 border-2 border-[#171519]" />
                )}
            </div>
            <p className="text-sm font-semibold text-white truncate group-hover:text-violet-200 transition">{list.name}</p>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <img
                        src={list.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt={list.user.username}
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${list.user.id}`) }}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    />
                    <span
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${list.user.id}`) }}
                        className="text-xs text-gray-400 truncate cursor-pointer hover:text-white transition"
                    >
                        {list.user.username}
                    </span>
                </div>
                {list.role && (
                    <span className="text-[10px] uppercase tracking-wider text-violet-300/70 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 flex-shrink-0">
                        {list.role}
                    </span>
                )}
                <span className={`flex items-center gap-1 text-xs transition flex-shrink-0 ${list.ifLiked ? "text-pink-400" : "text-gray-500"}`}>
                    <HeartIcon filled={list.ifLiked} />
                    <span>{list.likeCount}</span>
                </span>
            </div>
        </button>
    )
}

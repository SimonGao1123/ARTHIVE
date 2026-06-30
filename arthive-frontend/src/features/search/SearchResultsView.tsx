import type { User } from "@/types/domain/user"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"
import { SEARCH_BAR_QUERY } from "@/apollo/queries/shared_queries"
import type { SearchBarInput, SearchBarResponse } from "@/types/queries/shared_queries_types"
import { useLazyQuery } from "@apollo/client/react"
import { useEffect } from "react"
import { searchBarObtain } from "@/data/search/searchBarObtain"
import type { Media } from "@/types/domain/media"
import type { Review } from "@/types/domain/review"
import DisplayRating from "@/features/reviews/components/DisplayRating"
import type { AllUserListType } from "@/types/queries/list_queries_types"
import type { CommunityThread } from "@/types/queries/thread_queries_types"
import { contentTypeColor } from "@/shared/utils/contentTypeColors"
import { ALL_GENRES, ALL_CONTENT_TYPES } from "@/shared/utils/globalConstants"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"

const SEARCH_TYPES = [
    { key: "all",    label: "All" },
    { key: "media",  label: "Media" },
    { key: "user",   label: "Users" },
    { key: "review", label: "Reviews" },
    { key: "list",   label: "Lists" },
    { key: "thread", label: "Threads" },
] as const

    
export default function SearchPageResults({ setUser }: { setUser: (user: User) => void }) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [searchType, setSearchType] = useState(searchParams.get("searchType"))
    const [cursors, setCursors] = useState({ medias: null, users: null, reviews: null, lists: null, threads: null })
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loadCount, setLoadCount] = useState(0)
    const [contentTypes, setContentTypes] = useState<string[]>([])
    const [genres, setGenres] = useState<string[]>([])
    const [hasNextPage, setHasNextPage] = useState(false)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") ?? "")
    const [query, setQuery] = useState(searchParams.get("query"))

    const [obtainSearchBar, { loading }] = useLazyQuery<SearchBarResponse, SearchBarInput>(SEARCH_BAR_QUERY, {
        fetchPolicy: "no-cache",
    })

    const isValidSearchType = searchType === "all" || searchType === "media" || searchType === "user" || searchType === "review" || searchType === "list" || searchType === "thread"
    const LIMIT = searchType === "all" ? 3 : 15

    useEffect(() => {
        if (!searchParams.get("query") || !isValidSearchType) navigate("/")
    }, [])

    useEffect(() => {
        if (!query || !isValidSearchType) return
        const contentFilter = contentTypes.length > 0 ? { filter: "content_type", values: contentTypes } : null
        const genreFilter = genres.length > 0 ? { filter: "genre", values: genres } : null
        const normalizedFilters = [contentFilter, genreFilter].filter(Boolean)
        searchBarObtain(query, searchType, cursors, LIMIT, normalizedFilters, setCursors, setSearchResults, setHasNextPage, setUser, navigate, obtainSearchBar)
    }, [query, searchType, contentTypes, genres, loadCount])

    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setLoadCount(c => c + 1),
    })

    if (!searchParams.get("query") || !isValidSearchType) return null

    const resetState = () => {
        setSearchResults([])
        setCursors({ medias: null, users: null, reviews: null, lists: null, threads: null })
        setLoadCount(0)
    }

    const resetAndSetFilter = (setter: (v: string[]) => void, value: string, current: string[]) => {
        resetState()
        setter(current.includes(value) ? current.filter(v => v !== value) : [...current, value])
    }

    const clearFilters = () => {
        resetState()
        setContentTypes([])
        setGenres([])
    }

    const handleSearchTypeChange = (type: string) => {
        resetState()
        setSearchType(type)
        navigate(`/search?query=${searchQuery}&searchType=${type}`)
    }

    const handleSubmit = () => {
        resetState()
        setQuery(searchQuery)
        navigate(`/search?query=${searchQuery}&searchType=${searchType}`)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Search bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                        placeholder="Search ARTHIVE…"
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-violet-500 hover:bg-violet-400 text-white px-5 py-2.5 rounded-full text-sm transition"
                >
                    Search
                </button>
            </div>

            {/* Search type tabs */}
            <div className="flex gap-2 flex-wrap">
                {SEARCH_TYPES.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => handleSearchTypeChange(key)}
                        className={
                            "px-4 py-1.5 rounded-full text-sm transition border " +
                            (searchType === key
                                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                : "border-white/5 text-gray-400 hover:text-white hover:bg-white/5")
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Main content: results + sidebar filters */}
            <div className="flex gap-6 items-start">
                {/* Results */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-1">
                        {loading && <p className="text-gray-400 text-sm py-4 text-center">Searching…</p>}
                        {!loading && searchResults.length === 0 && (
                            <p className="text-gray-500 text-sm py-6 text-center">No results found.</p>
                        )}
                        <SearchResults searchResults={searchResults} />
                    </div>

                    {hasNextPage && <div ref={sentinelRef} className="h-1" />}
                </div>

                {/* Filters sidebar */}
                {searchType !== "user" && (
                    <div className="w-56 flex-shrink-0">
                        <Filters
                            contentTypes={contentTypes}
                            genres={genres}
                            searchType={searchType}
                            onToggleContentType={(v) => resetAndSetFilter(setContentTypes, v, contentTypes)}
                            onToggleGenre={(v) => resetAndSetFilter(setGenres, v, genres)}
                            onClearAll={clearFilters}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

type FiltersProps = {
    contentTypes: string[]
    genres: string[]
    searchType: string | null
    onToggleContentType: (value: string) => void
    onToggleGenre: (value: string) => void
    onClearAll: () => void
}

function Filters({ contentTypes, genres, searchType, onToggleContentType, onToggleGenre, onClearAll }: FiltersProps) {
    const showGenres = searchType !== "list"
    const hasActive = contentTypes.length > 0 || genres.length > 0
    const [contentTypeOpen, setContentTypeOpen] = useState(true)
    const [genresOpen, setGenresOpen] = useState(true)

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">Filters</p>
                {hasActive && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-[10px] text-gray-500 hover:text-violet-300 transition"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Content Type section */}
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => setContentTypeOpen(o => !o)}
                    className="flex items-center justify-between w-full text-left group"
                >
                    <p className="text-xs font-medium text-gray-400 group-hover:text-white transition">Content Type</p>
                    <span className="text-gray-600 text-xs">{contentTypeOpen ? "▲" : "▼"}</span>
                </button>
                {contentTypeOpen && (
                    <div className="flex flex-col gap-1.5">
                        {ALL_CONTENT_TYPES.map((ct) => {
                            const active = contentTypes.includes(ct)
                            const color = contentTypeColor(ct)
                            return (
                                <button
                                    key={ct}
                                    type="button"
                                    onClick={() => onToggleContentType(ct)}
                                    className="px-3 py-1.5 rounded-lg text-xs transition border text-left capitalize w-full"
                                    style={active
                                        ? { borderColor: color, color, backgroundColor: `${color}20` }
                                        : { borderColor: "rgba(255,255,255,0.07)", color: "#9ca3af" }
                                    }
                                >
                                    {ct}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Divider */}
            {showGenres && <div className="border-t border-white/5 my-1" />}

            {/* Genres section */}
            {showGenres && (
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => setGenresOpen(o => !o)}
                        className="flex items-center justify-between w-full text-left group"
                    >
                        <p className="text-xs font-medium text-gray-400 group-hover:text-white transition">Genre</p>
                        <span className="text-gray-600 text-xs">{genresOpen ? "▲" : "▼"}</span>
                    </button>
                    {genresOpen && (
                        <div className="flex flex-col gap-1.5">
                            {ALL_GENRES.map((g) => {
                                const active = genres.includes(g)
                                return (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => onToggleGenre(g)}
                                        className={
                                            "px-3 py-1.5 rounded-lg text-xs transition border text-left w-full " +
                                            (active
                                                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                                : "border-white/[0.07] text-gray-400 hover:text-white hover:bg-white/5")
                                        }
                                    >
                                        {g}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
    media:  { label: "Media",  className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    user:   { label: "User",   className: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    review: { label: "Review", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    list:   { label: "List",   className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    thread: { label: "Thread", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
}

function ResultTypeBadge({ type }: { type: string }) {
    const badge = TYPE_BADGE[type]
    if (!badge) return null
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.className}`}>
            {badge.label}
        </span>
    )
}

function SearchResults({ searchResults }: { searchResults: any[] }) {
    return (
        <>
            {searchResults.map((result) => {
                switch (result.type) {
                    case "media":   return <MediaResult   key={`media-result-${result.id}`}   media={result} />
                    case "user":    return <UserResult    key={`user-result-${result.id}`}    user={result} />
                    case "review":  return <ReviewResult  key={`review-result-${result.id}`}  review={result} />
                    case "list":    return <ListResult    key={`list-result-${result.id}`}    list={result} />
                    case "thread":  return <ThreadResult  key={`thread-result-${result.id}`}  thread={result} />
                    default:        return null
                }
            })}
        </>
    )
}

function MediaResult({ media }: { media: Media }) {
    const navigate = useNavigate()
    const color = contentTypeColor(media.contentType)
    return (
        <div
            onClick={() => navigate(`/media/${media.id}`)}
            className="flex items-center gap-4 py-4 border-b border-white/5 last:border-b-0 cursor-pointer group"
        >
            {media.coverImage ? (
                <img
                    src={media.coverImage}
                    alt={media.title}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    style={{ border: `2px solid ${color}` }}
                />
            ) : (
                <div className="w-12 h-16 rounded-lg flex-shrink-0 bg-white/5" style={{ border: `2px solid ${color}` }} />
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium group-hover:text-violet-300 transition truncate">{media.title}</p>
                    <ResultTypeBadge type="media" />
                </div>
                {media.contentType && (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full border mt-1 inline-block capitalize"
                        style={{ borderColor: color, color, backgroundColor: `${color}20` }}
                    >
                        {media.contentType}
                    </span>
                )}
            </div>
        </div>
    )
}

function UserResult({ user }: { user: User }) {
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/profile/${user.id}`)}
            className="flex items-center gap-4 py-4 border-b border-white/5 last:border-b-0 cursor-pointer group"
        >
            <img
                src={user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                alt={user.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <p className="text-white font-medium group-hover:text-violet-300 transition truncate">{user.username}</p>
                <ResultTypeBadge type="user" />
            </div>
        </div>
    )
}

function ReviewResult({ review }: { review: Review }) {
    const navigate = useNavigate()
    if (!review.media) return null
    const media = review.media
    return (
        <div className="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0">
            <img
                src={media.coverImage ?? "/default-ARTHIVE-cover.png"}
                alt={media.title}
                width={48}
                height={64}
                onClick={() => navigate(`/media/${media.id}`)}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                style={{ border: `2px solid ${contentTypeColor(media.contentType)}` }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        onClick={() => navigate(`/media/${media.id}`)}
                        className="text-white font-medium hover:text-violet-300 cursor-pointer transition truncate"
                    >
                        {media.title}
                    </p>
                    <ResultTypeBadge type="review" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <img
                        src={review.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt={review.user.username}
                        width={20}
                        height={20}
                        onClick={() => navigate(`/profile/${review.user.id}`)}
                        className="w-5 h-5 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                    />
                    <span
                        onClick={() => navigate(`/profile/${review.user.id}`)}
                        className="text-sm text-gray-400 hover:text-violet-300 cursor-pointer transition"
                    >
                        {review.user.username}
                    </span>
                    <DisplayRating rating={review.rating ?? 0} />
                </div>
                {review.content && (
                    <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{review.content}</p>
                )}
            </div>
        </div>
    )
}

function ListResult({ list }: { list: AllUserListType }) {
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/list/${list.id}`)}
            className="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0 cursor-pointer group"
        >
            {list.mediaInLists.length > 0 && (
                <div className="flex gap-1 flex-shrink-0">
                    {list.mediaInLists.slice(0, 3).map((mil: { media: { id: string, coverImage: string | null } }) => (
                        <img
                            key={mil.media.id}
                            src={mil.media.coverImage ?? "/default-ARTHIVE-cover.png"}
                            alt=""
                            width={32}
                            height={48}
                            className="w-8 h-12 object-cover rounded first:rounded-l-lg last:rounded-r-lg"
                        />
                    ))}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium group-hover:text-violet-300 transition truncate">{list.name}</p>
                    <ResultTypeBadge type="list" />
                </div>
                {list.description && (
                    <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{list.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {list.contentType.map((ct) => {
                        const color = contentTypeColor(ct)
                        return (
                            <span
                                key={ct}
                                className="text-xs px-2 py-0.5 rounded-full border capitalize"
                                style={{ borderColor: color, color, backgroundColor: `${color}20` }}
                            >
                                {ct}
                            </span>
                        )
                    })}
                    {list.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ThreadResult({ thread }: { thread: CommunityThread }) {
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/community/${thread.community?.media.id}/thread/${thread.id}`)}
            className="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0 cursor-pointer group"
        >
            {thread.community?.media.coverImage && (
                <img
                    src={thread.community.media.coverImage}
                    alt={thread.community.media.title}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                />
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium group-hover:text-violet-300 transition truncate">{thread.title}</p>
                    <ResultTypeBadge type="thread" />
                </div>
                {thread.community?.media.title && (
                    <p className="text-xs text-gray-500 mt-0.5">{thread.community.media.title}</p>
                )}
                {thread.content && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{thread.content}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                    <img
                        src={thread.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt={thread.user.username}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-500">{thread.user.username}</span>
                </div>
            </div>
        </div>
    )
}

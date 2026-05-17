import type { User } from "../types/user_types"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"
import { SEARCH_BAR_QUERY, type SearchBarInput, type SearchBarResponse } from "../types/queries/search_bar_queries"
import { useLazyQuery } from "@apollo/client/react"
import { useEffect } from "react"
import { searchBarObtain } from "../data/search_bar_obtain"
import type { Media } from "../types/media_type"
import type { Review } from "../types/review_type"
import DisplayRating from "../lib/DisplayRating"
import type { AllUserListType } from "../types/queries/lists_request_queries"
import type { CommunityThread } from "../types/queries/community_request_queries"
export default function SearchPageResults({ setUser }: { setUser: (user: User) => void }) {
    // includes search type and query (filter NOT included)
    const navigate = useNavigate()  
    const [searchParams] = useSearchParams()
    
    console.log(searchParams.get("query"))
    console.log(searchParams.get("searchType"))


    const [query, setQuery] = useState(searchParams.get("query"))
    const [searchType, setSearchType] = useState(searchParams.get("searchType"))


    if (!query || !(searchType === "all" || searchType === "media" || searchType === "user" || searchType === "review" || searchType === "list" || searchType === "thread")) {
        navigate("/")
        return
    }
    const LIMIT = searchType === "all" ? 1 : 5

    const [cursors, setCursors] = useState({
        medias: null,
        users: null,
        reviews: null,
        lists: null,
        threads: null
    })

    // stores all possible results (medias, users, reviews, lists, threads)
    const [searchResults, setSearchResults] = useState<any[]>([])

    const [loadCount, setLoadCount] = useState(0)

    // TODO: ADD MORE FILTERS
    const [contentTypes, setContentTypes] = useState<string[]>([])
    const [genres, setGenres] = useState<string[]>([])

    const [hasNextPage, setHasNextPage] = useState(false)

    const [obtainSearchBar, { loading }] = useLazyQuery<SearchBarResponse, SearchBarInput>(SEARCH_BAR_QUERY, {
        fetchPolicy: "no-cache",
    })
    useEffect(() => {

        const contentFilter = contentTypes.length > 0 ? {
            filter: "content_type",
            values: contentTypes
        } : null
        const genreFilter = genres.length > 0 ? {
            filter: "genre",
            values: genres
        } : null
        const normalizedFilters = [contentFilter, genreFilter].filter(Boolean)

        console.log("normalizedFilters", normalizedFilters)

        searchBarObtain(query, searchType, cursors, LIMIT, normalizedFilters, setCursors, setSearchResults, setHasNextPage, setUser, navigate, obtainSearchBar)
    }, [query, searchType, contentTypes, genres, loadCount])


    console.log(cursors)


    



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

    const [searchQuery, setSearchQuery] = useState(query ?? "")
    return (
        <div>
            <h1>Search Page Results</h1>
            {loading ? <p>Loading...</p> : null}
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => {
                navigate(`/search?query=${searchQuery}&searchType=${searchType}`)
                
            }}>Search</button>

            <button disabled={searchType === "all"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=all`)}>Search All</button>
            <button disabled={searchType === "media"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=media`)}>Search Media</button>
            <button disabled={searchType === "user"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=user`)}>Search User</button>
            <button disabled={searchType === "review"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=review`)}>Search Review</button>
            <button disabled={searchType === "list"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=list`)}>Search List</button>
            <button disabled={searchType === "thread"} onClick={() => navigate(`/search?query=${searchQuery}&searchType=thread`)}>Search Thread</button>

            <p>==============================================</p>
            {searchType !== "user" && (
                <Filters
                    contentTypes={contentTypes}
                    genres={genres}
                    searchType={searchType}
                    onToggleContentType={(v) => resetAndSetFilter(setContentTypes, v, contentTypes)}
                    onToggleGenre={(v) => resetAndSetFilter(setGenres, v, genres)}
                    onClearAll={clearFilters}
                />
            )}
            <SearchResults searchResults={searchResults} />
            {hasNextPage ? <button onClick={() => setLoadCount(loadCount + 1)}>Load More</button> : null}
        </div>
    )
}

const ALL_CONTENT_TYPES = ["film", "series", "book", "game"]
const ALL_GENRES = ["Drama", "Comedy", "Romance",
    "Action", "Adventure", "Horror", "Thriller",
    "Mystery", "Crime", "Science Fiction", "Fantasy",
    "Animation", "Musical", "Family", "Western",
    "War", "Historical", "Biographical",
    "Documentary", "Experimental", "Superhero",
    "Disaster", "Survival", "Sports", "Spy",
    "Political", "Road Movie", "Coming of Age",
    "Slice of Life", "Noir"]

type FiltersProps = {
    contentTypes: string[],
    genres: string[],
    searchType: string,
    onToggleContentType: (value: string) => void,
    onToggleGenre: (value: string) => void,
    onClearAll: () => void,
}

function Filters({ contentTypes, genres, searchType, onToggleContentType, onToggleGenre, onClearAll }: FiltersProps) {
    const showGenres = searchType !== "list"

    return (
        <div>
            <div>
                <p>Content Type</p>
                <div>
                    {ALL_CONTENT_TYPES.map((ct) => (
                        <button
                            key={ct}
                            type="button"
                            onClick={() => onToggleContentType(ct)}
                            style={{ fontWeight: contentTypes.includes(ct) ? "bold" : "normal" }}
                        >
                            {ct}
                        </button>
                    ))}
                </div>
            </div>
            {showGenres && (
                <div>
                    <p>Genre</p>
                    <div>
                        {ALL_GENRES.map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => onToggleGenre(g)}
                                style={{ fontWeight: genres.includes(g) ? "bold" : "normal" }}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {(contentTypes.length > 0 || genres.length > 0) && (
                <button type="button" onClick={onClearAll}>Clear Filters</button>
            )}
        </div>
    )
}

function SearchResults({ searchResults }: { searchResults: any[] }) {
    return (
        <div>
            {searchResults.map((result) => {
                switch (result.type) {
                    case "media":
                        return <MediaResult key={`media-result-${result.id}`} media={result} />
                    case "user":
                        return <UserResult key={`user-result-${result.id}`} user={result} />
                    case "review":
                        return <ReviewResult key={`review-result-${result.id}`} review={result} />
                    case "list":
                        return <ListResult key={`list-result-${result.id}`} list={result} />
                    case "thread":
                        return <ThreadResult key={`thread-result-${result.id}`} thread={result} />
                    default:
                        return null
                }
            })}
        </div>
    )
}

function MediaResult({ media }: { media: Media }) {
    const navigate = useNavigate()
    return (
        <div>
            <h2>Media Title: {media.title}</h2>
            {media.coverImage ? <img onClick={() => navigate(`/media/${media.id}`)} src={media.coverImage} alt={`Cover image for media ${media.id}`} width={100} height={150} /> : null}
        </div>
    )
}
function UserResult({ user }: { user: User }) {
    const navigate = useNavigate()
    return (
        <div>
            <h2>User Username: {user.username}</h2>
            <img onClick={() => navigate(`/profile/${user.id}`)} src={user.profilePicture ? user.profilePicture : "/default-ARTHIVE-pfp.png"} alt={`Profile picture for user ${user.id}`} width={100} height={100} />
        </div>
    )
}
function ReviewResult({ review }: { review: Review }) {
    const navigate = useNavigate()
    return (
        <div>
            <h2>Review Content: {review.content}</h2>
            <DisplayRating rating={review.rating ?? 0} />
            <p>{review.media.title}</p>
            <img onClick={() => navigate(`/media/${review.media.id}`)} src={review.media.coverImage ? review.media.coverImage : "/default-ARTHIVE-cover.png"} alt={`Cover image for media ${review.media.id}`} width={100} height={150} />
            <p>Review User Username: {review.user.username}</p>
            <img onClick={() => navigate(`/profile/${review.user.id}`)} src={review.user.profilePicture ? review.user.profilePicture : "/default-ARTHIVE-pfp.png"} alt={`Profile picture for user ${review.user.id}`} width={100} height={100} />
        </div>
    )
}
function ListResult({ list }: { list: AllUserListType }) {
    const navigate = useNavigate()
    return (
        <div>
            <h2 onClick={() => navigate(`/list/${list.id}`)}>List Name: {list.name}</h2>
            <p>List Description: {list.description}</p>
            <p>Content Type: {list.contentType.join(", ")}</p>
            <p>Tags: {list.tags.join(", ")}</p>
            {
                list.mediaInLists.map((mediaInList: { media: { id: string, coverImage: string | null } }) => {
                    return (
                        <div key={mediaInList.media.id}>
                            <img src={mediaInList.media.coverImage!} alt={`Cover image for media ${mediaInList.media.id}`} width={100} height={150} />
                        </div>
                    )
                })
            }
        </div>
    )
}
function ThreadResult({ thread }: { thread: CommunityThread }) {
    const navigate = useNavigate()
    return (
        <div>
            <h2 onClick={() => navigate(`/community/${thread.community?.media.id}/thread/${thread.id}`)}>Thread Title: {thread.title}</h2>
            <p>Thread Content: {thread.content}</p>
            <p>Thread User Username: {thread.user.username}</p>
            <img src={thread.user.profilePicture ? thread.user.profilePicture : "/default-ARTHIVE-pfp.png"} alt={`Profile picture for user ${thread.user.id}`} width={100} height={100} />
            <p>Thread Community Media Title: {thread.community?.media.title}</p>
            <img src={thread.community?.media.coverImage ? thread.community.media.coverImage : "/default-ARTHIVE-cover.png"} alt={`Cover image for media ${thread.community?.media.id}`} width={100} height={150} />
        </div>
    )
}
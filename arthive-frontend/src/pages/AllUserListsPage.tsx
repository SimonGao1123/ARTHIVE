import { useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { AllUserListType, ObtainAllUserListsInput, ObtainAllUserListsResponse, RoleFilter } from "../types/queries/lists_request_queries"
import { OBTAIN_ALL_USER_LISTS_QUERY } from "../types/queries/lists_request_queries"
import { useLazyQuery } from "@apollo/client/react"
import { obtainAllUserListsData } from "../data/obtain_all_user_lists_data"
import ContentFilter from "../lib/ContentFilter"
import { NumberedPagination } from "../lib/NumberedPagination"
import { contentTypeColor } from "../lib/contentTypeColors"
import RoleFilterPanel from "../lib/RoleFilter"

const LIMIT = 10

export default function AllUserListsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user_id) navigate("/")
    }, [user_id])

    if (!user_id) return null

    return (
        <div className="flex flex-col gap-4">
            <AllUserListsComponent setUser={setUser} user_id={user_id} if_adding_media={false} addOrRemoveMediaFromList={null} listsWithMedia={[]} excludeMediaId={null} />
            <button
                onClick={() => navigate("/create_list")}
                className="self-start bg-violet-500 hover:bg-violet-400 text-white px-5 py-2 rounded-full text-sm transition"
            >
                + Create New List
            </button>
        </div>
    )
}

type AllUserListsComponentProps = {
    setUser: (user: User | null) => void
    user_id: string
    if_adding_media: boolean
    excludeMediaId: string | null
    addOrRemoveMediaFromList: ((listId: string, ifAdd: boolean) => void) | null
    listsWithMedia: string[]
}
// reusable component for adding media to lists, if if_adding_media is true, then the component will show a list of lists that the user can add the media to
export function AllUserListsComponent({setUser, user_id, if_adding_media, excludeMediaId, addOrRemoveMediaFromList, listsWithMedia}: AllUserListsComponentProps) {
    if (if_adding_media && !addOrRemoveMediaFromList) {
        throw new Error("addOrRemoveMediaFromList is required if if_adding_media is true")
    }
    const navigate = useNavigate()
    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [pageNum, setPageNum] = useState(1)

    const [lists, setLists] = useState<AllUserListType[]>([])
    const [targetUser, setTargetUser] = useState<User | null>(null)

    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)
    const [roleFilter, setRoleFilter] = useState<RoleFilter>(null)

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) return
        setLists([])
        setPageNum(1)
        setContentType(nextContentType)
    }

    const handleRoleFilterChange = (nextRole: RoleFilter) => {
        if (nextRole === roleFilter) return
        setLists([])
        setPageNum(1)
        setRoleFilter(nextRole)
    }

    const [obtainAllUserLists, { loading, error }] = useLazyQuery<ObtainAllUserListsResponse, ObtainAllUserListsInput>(OBTAIN_ALL_USER_LISTS_QUERY, {
        fetchPolicy: "no-cache",
    })
    useEffect(() => {
        if (!user_id) {
            navigate("/")
            return
        }
        obtainAllUserListsData(user_id, contentType, query, setTotalPages, LIMIT, obtainAllUserLists, setLists, setTargetUser, navigate, setUser, pageNum, excludeMediaId, roleFilter)
    }, [contentType, pageNum, query, roleFilter])

    return (
        <div className="flex flex-col gap-4">
            {targetUser && !if_adding_media && (
                <h1 className="text-2xl font-bold text-white">{targetUser.username}'s Lists</h1>
            )}

            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search lists"
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

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {error.message}
                </div>
            )}
            {loading && <div className="text-gray-400 text-sm">Loading…</div>}

            <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {lists && lists.length === 0 && !loading ? (
                        <p className="text-gray-500 text-sm py-6 text-center">No lists found.</p>
                    ) : null}
                    {lists && lists.map((list) => (
                        <div key={list.id} className="bg-[#171519] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                            <ListCard list={list}/>
                            {if_adding_media && addOrRemoveMediaFromList && (
                                listsWithMedia.includes(list.id) ?
                                <button
                                    onClick={() => addOrRemoveMediaFromList(list.id, false)}
                                    className="self-end bg-red-500 hover:bg-red-400 text-white px-4 py-1.5 rounded-full text-sm transition"
                                >
                                    - Remove from list
                                </button>
                                :
                                <button
                                    onClick={() => addOrRemoveMediaFromList(list.id, true)}
                                    className="self-end bg-violet-500 hover:bg-violet-400 text-white px-4 py-1.5 rounded-full text-sm transition"
                                >
                                    + Add to list
                                </button>
                            )}
                        </div>
                    ))}
                    <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
                </div>
                {!if_adding_media && (
                    <RoleFilterPanel currRole={roleFilter} setRole={handleRoleFilterChange} />
                )}
            </div>
        </div>
    )
}

function ListCard({list}: {list: AllUserListType}) {
    const navigate = useNavigate()
    return (
        <div className="flex gap-8">
            {list.mediaInLists.length > 0 && (
                <div className="flex items-end flex-shrink-0">
                    {list.mediaInLists.slice(0, 3).map((mediaInList, i) => (
                        <img
                            key={mediaInList.media.id}
                            src={mediaInList.media.coverImage || "/default-ARTHIVE-cover.png"}
                            alt={String(mediaInList.media.id)}
                            className="w-16 h-full object-cover rounded-lg border-2 border-[#171519] shadow-md"
                            style={{ marginLeft: i === 0 ? 0 : '-1.5rem', zIndex: i + 1, position: 'relative', minHeight: '7rem' }}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <h2
                        onClick={() => navigate(`/list/${list.id}`)}
                        className="text-lg font-semibold text-white hover:text-violet-300 cursor-pointer transition"
                    >
                        {list.name}
                    </h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {list.role && (
                            <span className={
                                "text-xs px-2 py-0.5 rounded-full border " +
                                (list.role === "owner"
                                    ? "border-violet-500/40 text-violet-300 bg-violet-500/10"
                                    : list.role === "admin"
                                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                    : "border-white/10 text-gray-400 bg-white/5")
                            }>
                                {list.role[0].toUpperCase() + list.role.slice(1)}
                            </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${list.ifPrivate ? "border-amber-500/40 text-amber-300 bg-amber-500/10" : "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"}`}>
                            {list.ifPrivate ? "Private" : "Public"}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-gray-300">{list.description || <span className="text-gray-500 italic">No description</span>}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {list.contentType.map((ct) => (
                        <span
                            key={ct}
                            className="px-2 py-0.5 rounded-full border"
                            style={{ borderColor: contentTypeColor(ct), color: contentTypeColor(ct), backgroundColor: `${contentTypeColor(ct)}11` }}
                        >
                            {ct}
                        </span>
                    ))}
                    {list.tags.length > 0 && list.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-gray-500">
                    Updated {new Date(list.updatedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    )
}

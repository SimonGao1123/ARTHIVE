import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { User } from "@/types/domain/user"
import type { AllUserListType, ObtainAllUserListsResponse, ObtainAllUserListsInput, RoleFilter } from "@/types/queries/list_queries_types"
import { OBTAIN_ALL_USER_LISTS_QUERY } from "@/apollo/queries/list_queries"
import { useLazyQuery } from "@apollo/client/react"
import { obtainAllUserListsData } from "@/data/lists/obtainAllUserListsData"
import ContentFilter from "@/shared/components/ContentFilter"
import { NumberedPagination } from "@/shared/components/NumberedPagination"
import RoleFilterPanel from "@/features/lists/components/RoleFilter"
import ListCard from "@/features/lists/components/ListCard"

const LIMIT = 10

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


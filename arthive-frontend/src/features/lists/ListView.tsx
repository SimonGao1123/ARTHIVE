import { useEffect, useState } from "react";
import type { User } from "@/types/domain/user";
import { useNavigate, useParams } from "react-router-dom";
import type { Media } from "@/types/domain/media";
import type { ListType, ObtainListPageInput, ObtainListPageResponse } from "@/types/queries/list_queries_types";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { OBTAIN_LIST_PAGE_QUERY } from "@/apollo/queries/list_queries"
import { obtainListDetails } from "@/data/lists/obtainListDetails";
import { NumberedPagination } from "@/shared/components/NumberedPagination";
import type { AddOrRemoveMediaInListInput, AddOrRemoveMediaInListResponse } from "@/types/mutations/media_mutations_types";
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION } from "@/apollo/mutations/media_mutations"
import { addOrRemoveMediaData } from "@/data/media/addOrRemoveMediaData";
import { contentTypeColor } from "@/shared/utils/contentTypeColors";
import { LikeButton, PencilIcon } from "@/shared/components/StyledComponents";
import ListMediaCard from "@/features/lists/components/ListMediaCard";
import ListMembersDropdown from "@/features/lists/components/ListMembersDropdown";
import { LIKE_LIST_MUTATION } from "@/apollo/mutations/list_mutations"
import type { LikeListInput, LikeListResponse } from "@/types/mutations/list_mutations_types"
import { likeListFunction } from "@/data/lists/likeListFunction";
import EditListDetails from "@/features/lists/components/EditListDetails";
const LIMIT = 3

export default function ListPage({ user, setUser }: { user: User | null, setUser: (user: User | null) => void }) {
    if (!user) return null
    const { list_id } = useParams()
    const navigate = useNavigate()

    const [totalPages, setTotalPages] = useState(0)
    const [mediaInLists, setMediaInLists] = useState<Media[]>([])
    const [listData, setListData] = useState<ListType | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string>("")
    const [removeMediaId, setRemoveMediaId] = useState<string>("")
    const [ifEditListDetails, setIfEditListDetails] = useState<boolean>(false)

    const [obtainListPage, { loading, error }] = useLazyQuery<ObtainListPageResponse, ObtainListPageInput>(OBTAIN_LIST_PAGE_QUERY, {
        fetchPolicy: "no-cache",
    })
    const [addOrRemoveMediaInListMutation, { loading: removeLoading, error: removeError }] =
        useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)
    const [likeList] = useMutation<LikeListResponse, LikeListInput>(LIKE_LIST_MUTATION)
    const [currLiked, setCurrLiked] = useState<boolean>(false)
    const [likeCount, setLikeCount] = useState<number>(0)
    useEffect(() => {
        if (listData) {
            setCurrLiked(listData.ifLiked)
            setLikeCount(listData.likeCount)
        }
    }, [listData?.id])

    function handleLikeList() {
        if (!list_id) return
        setCurrLiked(prev => !prev)
        likeListFunction(setCurrLiked, likeList, list_id, setUser, navigate, setLikeCount)
    }

    useEffect(() => {
        if (!list_id) navigate("/")
    }, [list_id])

    function refreshList() {
        if (!list_id) return
        obtainListDetails(list_id, pageNum, LIMIT, query, setUser, setTotalPages, navigate, obtainListPage, setTargetUser, setListData, setMediaInLists)
    }

    useEffect(() => {
        if (!list_id || removeMediaId === "") return
        addOrRemoveMediaData(addOrRemoveMediaInListMutation, list_id, [removeMediaId], setUser, navigate, false, refreshList)
        setRemoveMediaId("")
    }, [removeMediaId])

    useEffect(() => {
        refreshList()
    }, [list_id, pageNum, query])

    if (!list_id) return null

    return (
        <div className="flex flex-col gap-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {error.message}
                </div>
            )}
            {removeError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {removeError.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500 mb-0.5">{targetUser?.username}'s list</p>
                    <h1 className="text-2xl font-bold text-white">{listData?.name ?? "…"}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {listData && (
                        <ListMembersDropdown
                            owner={targetUser ? { id: String(targetUser.id), username: targetUser.username, profilePicture: targetUser.profilePicture ?? null } : null}
                            publicMembers={listData.publicListMembers ?? null}
                            allMembers={listData.allListMembers ?? null}
                            canEdit={!!listData.ifEditable}
                            currentUserId={String(user.id)}
                            currentUserRole={listData.role as "owner" | "admin" | "member" | null}
                            setUser={setUser}
                            listId={listData.id}
                        />
                    )}
                    {listData && (
                        <LikeButton liked={currLiked} count={likeCount} onClick={handleLikeList} />
                    )}
                    { listData?.ifEditable ? (
                    <button
                        type="button"
                        onClick={() => setIfEditListDetails(!ifEditListDetails)}
                        className={
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition border " +
                            (ifEditListDetails
                                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                                : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5")
                        }
                    >
                        <PencilIcon />
                        {ifEditListDetails ? "Cancel" : "Edit"}
                    </button>
                    ) : <></>}
                </div>
            </div>

            {/* List details / edit form */}
            {ifEditListDetails && listData?.ifEditable ? (
                <EditListDetails
                    listData={listData as ListType}
                    setListData={setListData}
                    setUser={setUser}
                    navigate={navigate}
                    setIfEditListDetails={setIfEditListDetails}
                    currentStatus={listData?.role as "admin" | "member" | "owner" | null}
                />
            ) : (
                <ListDetails listData={listData} />
            )}

            {/* Search */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search in list"
                    value={currQuery}
                    onChange={(e) => setCurrQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && currQuery !== (query ?? "")) setQuery(currQuery || null) }}
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
                <button
                    disabled={currQuery === (query ?? "")}
                    onClick={() => setQuery(currQuery || null)}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Search
                </button>
            </div>

            {/* Media list */}
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}
            {removeLoading && <p className="text-gray-400 text-sm">Removing…</p>}

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6">
                {mediaInLists.length === 0 && !loading ? (
                    <p className="text-gray-500 text-sm text-center py-6">No media in this list.</p>
                ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))" }}>
                        {mediaInLists.map((media) => (
                            <ListMediaCard
                                key={media.id}
                                media_data={media}
                                setRemoveMediaId={setRemoveMediaId}
                                setMediaInLists={setMediaInLists}
                                canRemove={listData?.ifEditable ?? false}
                            />
                        ))}
                    </div>
                )}
            </div>

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

function ListDetails({ listData }: { listData: ListType | null }) {
    if (!listData) return null
    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-3">
            {listData.description && (
                <p className="text-gray-300 leading-relaxed">{listData.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
                {listData.role && (
                    <span className={
                        "text-xs px-2 py-0.5 rounded-full border " +
                        (listData.role === "owner"
                            ? "border-violet-500/40 text-violet-300 bg-violet-500/10"
                            : listData.role === "admin"
                            ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                            : "border-white/10 text-gray-400 bg-white/5")
                    }>
                        {listData.role[0].toUpperCase() + listData.role.slice(1)}
                    </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${listData.ifPrivate ? "border-amber-500/40 text-amber-300 bg-amber-500/10" : "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"}`}>
                    {listData.ifPrivate ? "Private" : "Public"}
                </span>
                {listData.contentType.map((ct) => {
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
                {listData.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        #{tag}
                    </span>
                ))}
            </div>
            <p className="text-xs text-gray-500">
                Updated {new Date(listData.updatedAt).toLocaleDateString()}
                {" · "}
                Created {new Date(listData.createdAt).toLocaleDateString()}
            </p>
        </div>
    )
}



import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "../types/user_types";
import { useNavigate, useParams } from "react-router-dom";
import type { Media } from "../types/media_type";
import type { ListType, ObtainListPageInput, ObtainListPageResponse } from "../types/queries/lists_request_queries";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { OBTAIN_LIST_PAGE_QUERY } from "../types/queries/lists_request_queries";
import { obtainListDetails } from "../data/obtain_list_details";
import { NumberedPagination } from "../lib/NumberedPagination";
import type { AddOrRemoveMediaInListInput, AddOrRemoveMediaInListResponse } from "../types/mutations/create_edit_list_mutation";
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION, EDIT_LIST_DETAILS_MUTATION } from "../types/mutations/create_edit_list_mutation";
import { addOrRemoveMediaData } from "../data/add_or_remove_media_data";
import type { EditListDetailsResponse, EditListDetailsInput } from "../types/mutations/create_edit_list_mutation";
import { editListDetails } from "../data/edit_list_details";
import { contentTypeColor } from "../lib/contentTypeColors";
import { EyeIcon, EyeOffIcon, PencilIcon, TrashIcon } from "../lib/StyledComponents";

const LIMIT = 10

export default function ListPage({ setUser }: { setUser: (user: User | null) => void }) {
    const { list_id } = useParams()
    const navigate = useNavigate()

    if (!list_id) { navigate("/"); return }

    const [totalPages, setTotalPages] = useState(0)
    const [mediaInLists, setMediaInLists] = useState<Media[]>([])
    const [listData, setListData] = useState<ListType | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [pageNum, setPageNum] = useState(1)

    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string>("")

    const [obtainListPage, { loading, error }] = useLazyQuery<ObtainListPageResponse, ObtainListPageInput>(OBTAIN_LIST_PAGE_QUERY)

    const [addOrRemoveMediaInListMutation, { loading: removeLoading, error: removeError }] =
        useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)

    const [removeMediaId, setRemoveMediaId] = useState<string>("")
    useEffect(() => {
        if (removeMediaId !== "") {
            addOrRemoveMediaData(addOrRemoveMediaInListMutation, list_id as string, [removeMediaId], setUser, navigate, false)
            setRemoveMediaId("")
        }
    }, [removeMediaId])

    useEffect(() => {
        obtainListDetails(list_id as string, pageNum, LIMIT, query, setUser, setTotalPages, navigate, obtainListPage, setTargetUser, setListData, setMediaInLists)
    }, [list_id, pageNum, query])

    const [ifEditListDetails, setIfEditListDetails] = useState<boolean>(false)

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
            </div>

            {/* List details / edit form */}
            {ifEditListDetails ? (
                <EditListDetails
                    listData={listData as ListType}
                    setListData={setListData}
                    setUser={setUser}
                    navigate={navigate}
                    setIfEditListDetails={setIfEditListDetails}
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
                    onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery || null) }}
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

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-1">
                {mediaInLists.length === 0 && !loading && (
                    <p className="text-gray-500 text-sm text-center py-6">No media in this list.</p>
                )}
                {mediaInLists.map((media) => (
                    <ListMediaCard
                        key={media.id}
                        media_data={media}
                        setRemoveMediaId={setRemoveMediaId}
                        setMediaInLists={setMediaInLists}
                    />
                ))}
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

function ListMediaCard({ media_data, setRemoveMediaId, setMediaInLists }: { media_data: Media, setRemoveMediaId: Dispatch<SetStateAction<string>>, setMediaInLists: Dispatch<SetStateAction<Media[]>> }) {
    const navigate = useNavigate()
    const color = contentTypeColor(media_data.contentType)
    return (
        <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-b-0">
            <img
                onClick={() => navigate(`/media/${media_data.id}`)}
                src={media_data.coverImage || "/default-ARTHIVE-cover.png"}
                alt={media_data.title}
                width={48}
                height={64}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                style={{ border: `2px solid ${color}` }}
            />
            <div className="flex-1 min-w-0">
                <p
                    onClick={() => navigate(`/media/${media_data.id}`)}
                    className="text-white font-medium hover:text-violet-300 cursor-pointer transition truncate"
                >
                    {media_data.title}
                </p>
                {media_data.contentType && (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full border mt-1 inline-block capitalize"
                        style={{ borderColor: color, color, backgroundColor: `${color}20` }}
                    >
                        {media_data.contentType}
                    </span>
                )}
            </div>
            <button
                onClick={() => {
                    setRemoveMediaId(media_data.id.toString())
                    setMediaInLists((prev: Media[]) => prev.filter((m) => m.id !== media_data.id))
                }}
                className="flex-shrink-0 p-2 rounded-lg border border-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition"
                title="Remove from list"
            >
                <TrashIcon />
            </button>
        </div>
    )
}

function EditListDetails({ listData, setListData, setUser, navigate, setIfEditListDetails }: { listData: ListType, setListData: Dispatch<SetStateAction<ListType | null>>, setUser: (user: User | null) => void, navigate: any, setIfEditListDetails: Dispatch<SetStateAction<boolean>> }) {
    const [editListDetailsMutation, { loading, error }] = useMutation<EditListDetailsResponse, EditListDetailsInput>(EDIT_LIST_DETAILS_MUTATION)

    const [newName, setNewName] = useState<string>(listData?.name ?? "")
    const [newDescription, setNewDescription] = useState<string>(listData?.description ?? "")
    const [newTags, setNewTags] = useState<string>(listData?.tags?.join(", ") ?? "")
    const [newIfPrivate, setNewIfPrivate] = useState<boolean>(listData?.ifPrivate ?? false)

    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {error.message}
                </div>
            )}
            {loading && <p className="text-gray-400 text-sm">Saving…</p>}

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Name</label>
                <input
                    type="text"
                    placeholder="List name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
                <textarea
                    placeholder="What is this list about?"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                    className="bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full resize-none"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tags</label>
                <input
                    type="text"
                    placeholder="Tags separated by comma (e.g. horror, 2024)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Visibility</label>
                <button
                    type="button"
                    onClick={() => setNewIfPrivate(!newIfPrivate)}
                    className={
                        "w-full py-2.5 px-4 text-sm rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 " +
                        (newIfPrivate
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_18px_-4px_rgba(245,158,11,0.25)] scale-[1.02]"
                            : "border-transparent text-gray-300 hover:text-white hover:bg-white/5")
                    }
                >
                    {newIfPrivate ? <EyeOffIcon /> : <EyeIcon />}
                    {newIfPrivate ? "Private" : "Public"}
                </button>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => {
                        editListDetails(listData?.id as string, newName, newIfPrivate, newTags, newDescription, setUser, navigate, editListDetailsMutation, setListData)
                        setIfEditListDetails(false)
                    }}
                    className="bg-violet-500 hover:bg-violet-400 text-white px-6 py-2 rounded-full text-sm transition"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIfEditListDetails(false)
                        setNewName(listData?.name ?? "")
                        setNewDescription(listData?.description ?? "")
                        setNewTags(listData?.tags?.join(", ") ?? "")
                        setNewIfPrivate(listData?.ifPrivate ?? false)
                    }}
                    className="border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 px-6 py-2 rounded-full text-sm transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

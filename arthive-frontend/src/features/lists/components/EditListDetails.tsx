import type { ListType } from "@/types/queries/list_queries_types"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { EDIT_LIST_DETAILS_MUTATION } from "@/apollo/mutations/list_mutations"
import type { EditListDetailsResponse, EditListDetailsInput } from "@/types/mutations/list_mutations_types"
import { DELETE_ALL_LIST_MEMBERS_MUTATION } from "@/apollo/mutations/list_mutations"
import type { DeleteAllListMembersMutation, DeleteAllListMembersMutationVariables } from "@/types/mutations/list_mutations_types"
import type { User } from "@/types/domain/user"
import InviteMembersPanel from "@/features/lists/components/InviteMembersPanel"
import { EyeIcon, EyeOffIcon } from "@/shared/components/StyledComponents"
import { editListDetails } from "@/data/lists/editListDetails"
import { deleteAllListMembersData } from "@/data/lists/deleteAllListMembersData"
export default function EditListDetails({ listData, setListData, setUser, navigate, setIfEditListDetails, currentStatus }: { listData: ListType, setListData: Dispatch<SetStateAction<ListType | null>>, setUser: (user: User | null) => void, navigate: any, setIfEditListDetails: Dispatch<SetStateAction<boolean>>, currentStatus: "admin" | "member" | "owner" | null }) {
    const [editListDetailsMutation, { loading, error }] = useMutation<EditListDetailsResponse, EditListDetailsInput>(EDIT_LIST_DETAILS_MUTATION)

    const [newName, setNewName] = useState<string>(listData?.name ?? "")
    const [newDescription, setNewDescription] = useState<string>(listData?.description ?? "")
    const [newTags, setNewTags] = useState<string>(listData?.tags?.join(", ") ?? "")
    const [newIfPrivate, setNewIfPrivate] = useState<boolean>(listData?.ifPrivate ?? false)
    const [inviteMembersOpen, setInviteMembersOpen] = useState<boolean>(false)
    const [deleteAllListMembersMutation] = useMutation<DeleteAllListMembersMutation, DeleteAllListMembersMutationVariables>(DELETE_ALL_LIST_MEMBERS_MUTATION)

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

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Members</label>
                <button
                    type="button"
                    onClick={() => setInviteMembersOpen(true)}
                    className="self-end px-4 py-1.5 rounded-full text-sm transition border border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20"
                >
                    + Members
                </button>
            </div>

            {inviteMembersOpen && (
                <InviteMembersPanel
                    listId={listData.id}
                    setUser={setUser}
                    onClose={() => setInviteMembersOpen(false)}
                    currentStatus={currentStatus}
                />
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => {
                        editListDetails(listData?.id as string, newName, newIfPrivate, newTags, newDescription, setUser, navigate, editListDetailsMutation, setListData, false)
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
                <button
                    disabled={listData?.role !== "owner"}
                    type="button"
                    onClick={() => {
                        editListDetails(listData?.id as string, newName, newIfPrivate, newTags, newDescription, setUser, navigate, editListDetailsMutation, setListData, true)
                        setIfEditListDetails(false)
                    }}
                    className="bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-full text-sm transition"
                >
                    Delete List</button>
                <button
                    disabled={listData?.role !== "owner"}
                    type="button"
                    onClick={() => deleteAllListMembersData(listData.id, navigate, setUser, deleteAllListMembersMutation)}
                    className="bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-full text-sm transition"
                >
                    Delete Members
                </button>
            </div>
        </div>
    )
}

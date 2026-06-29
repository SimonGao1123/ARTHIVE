import { useState } from "react"
import type { User } from "@/types/domain/user"
import type { CreateListInput, CreateListResponse } from "@/types/mutations/list_mutations_types"
import { useMutation } from "@apollo/client/react"
import { CREATE_LIST_MUTATION } from "@/apollo/mutations/list_mutations"
import { useNavigate } from "react-router-dom"
import { createList } from "@/data/lists/createList"
import { EyeIcon, EyeOffIcon } from "@/shared/components/StyledComponents"
import MediaQuickSearch from "@/features/lists/components/MediaQuickSearch"

export default function CreateListPage({setUser, user}: {setUser: (user: User) => void, user: User | null}) {

    const [addedMediaIds, setAddedMediaIds] = useState<string[]>([])
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const [currTags, setCurrTags] = useState<string>("")

    const [ifPrivate, setIfPrivate] = useState<boolean>(false)

    const [createListMutation, {loading, error}] = useMutation<CreateListResponse, CreateListInput>(CREATE_LIST_MUTATION)
    const navigate = useNavigate()

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-white">Create List</h1>

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                        {error.message}
                    </div>
                )}
                {loading && <div className="text-gray-400 text-sm">Creating list…</div>}

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Name</label>
                    <input
                        type="text"
                        placeholder="List name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
                    <textarea
                        placeholder="What is this list about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full resize-none"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tags</label>
                    <input
                        type="text"
                        placeholder="Tags separated by comma (e.g. horror, 2024)"
                        value={currTags}
                        onChange={(e) => setCurrTags(e.target.value)}
                        className="bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-full"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Visibility</label>
                    <button
                        type="button"
                        onClick={() => setIfPrivate(!ifPrivate)}
                        className={
                            "w-full py-2.5 px-4 text-sm rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 " +
                            (ifPrivate
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_18px_-4px_rgba(245,158,11,0.25)] scale-[1.02]"
                                : "border-transparent text-gray-300 hover:text-white hover:bg-white/5")
                        }
                    >
                        {ifPrivate ? <EyeOffIcon /> : <EyeIcon />}
                        {ifPrivate ? "Private" : "Public"}
                    </button>
                </div>

                <MediaQuickSearch setAddedMediaIds={setAddedMediaIds} setUser={setUser} addedMediaIds={addedMediaIds} />

                <button
                    onClick={() => {
                        createList(name, description, currTags, addedMediaIds, ifPrivate, setUser, navigate, createListMutation)
                        navigate(`/all_lists/${user?.id ?? ""}`)
                    }}
                    className="bg-violet-500 hover:bg-violet-400 text-white px-6 py-2 rounded-full text-sm transition self-start"
                >
                    Create List
                </button>
            </div>
        </div>
    )
}

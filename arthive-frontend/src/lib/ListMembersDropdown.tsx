import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ListMemberSummary } from "../types/queries/lists_request_queries"
import type { User } from "../types/user_types"
import ListMemberActionButtons from "./ListMemberActionButtons"

type Owner = { id: string, username: string, profilePicture: string | null }
type ViewerRole = "owner" | "admin" | "member" | null

type Props = {
    owner: Owner | null
    publicMembers: ListMemberSummary[] | null
    allMembers: ListMemberSummary[] | null
    canEdit: boolean
    currentUserId: string
    currentUserRole: ViewerRole
    setUser: (u: User | null) => void
    listId: string
}

function roleBadgeClass(role: string) {
    if (role === "admin") return "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
    return "border-white/10 text-gray-400 bg-white/5"
}

export default function ListMembersDropdown({ owner, publicMembers, allMembers, canEdit, currentUserId, currentUserRole, setUser, listId }: Props) {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const sourceMembers = canEdit && allMembers ? allMembers : (publicMembers ?? [])
    const [liveMembers, setLiveMembers] = useState<ListMemberSummary[]>(sourceMembers)
    useEffect(() => {
        setLiveMembers(sourceMembers)
    }, [allMembers, publicMembers, canEdit])

    const sorted = useMemo(() => {
        return [...liveMembers].sort((a, b) => {
            if (a.role !== b.role) return a.role === "admin" ? -1 : 1
            if (a.status !== b.status) return a.status === "accepted" ? -1 : 1
            return a.user.username.localeCompare(b.user.username)
        })
    }, [liveMembers])

    useEffect(() => {
        if (!open) return
        function onMouseDown(e: MouseEvent) {
            if (!wrapperRef.current) return
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        window.addEventListener("mousedown", onMouseDown)
        return () => window.removeEventListener("mousedown", onMouseDown)
    }, [open])

    function handleMemberChanged(updated: ListMemberSummary | null, originalId: string) {
        setLiveMembers(prev =>
            updated === null
                ? prev.filter(m => m.id !== originalId)
                : prev.map(m => m.id === originalId ? updated : m)
        )
    }

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            >
                Members
                <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-[60vh] overflow-y-auto bg-[#171519] border border-white/10 rounded-2xl shadow-xl shadow-black/40 z-20">
                    <div className="flex flex-col divide-y divide-white/5">
                        {owner && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpen(false)
                                    navigate(`/profile/${owner.id}`)
                                }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition text-left"
                            >
                                <img
                                    src={owner.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                                    alt={owner.username}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{owner.username}</p>
                                    <p className="text-xs text-gray-500">Owner</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full border border-violet-500/40 text-violet-300 bg-violet-500/10 flex-shrink-0">
                                    Owner
                                </span>
                            </button>
                        )}
                    {sorted.length === 0 && !owner ? (
                        <p className="text-gray-500 text-sm text-center py-6">No members yet</p>
                    ) : (
                        <>
                            {sorted.map(m => (
                                <div
                                    key={m.id}
                                    className={
                                        "flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition text-left " +
                                        (m.status === "pending" ? "opacity-60" : "")
                                    }
                                >
                                    <img
                                        src={m.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                                        alt={m.user.username}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setOpen(false)
                                            navigate(`/profile/${m.user.id}`)
                                        }}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                                    />
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setOpen(false)
                                            navigate(`/profile/${m.user.id}`)
                                        }}
                                    >
                                        <p className="text-sm text-white truncate hover:text-violet-300 transition">{m.user.username}</p>
                                        <p className="text-xs text-gray-500 capitalize">{m.role} · {m.status}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${roleBadgeClass(m.role)}`}>
                                        {m.role}
                                    </span>
                                    <ListMemberActionButtons
                                        member={m}
                                        listId={listId}
                                        currentUserRole={currentUserRole}
                                        currentUserId={currentUserId}
                                        setUser={setUser}
                                        onChanged={(updated) => handleMemberChanged(updated, m.id)}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                    </div>
                </div>
            )}
        </div>
    )
}

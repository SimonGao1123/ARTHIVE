import { useEffect, useRef, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useNavigate } from "react-router-dom"
import { LIST_INVITATION_USER_SEARCH_QUERY } from "@/apollo/queries/user_queries"
import type { ListInvitationUserSearchInput, ListInvitationUserSearchResponse, InvitableUser } from "@/types/queries/user_queries_types"
import { INVITE_USER_TO_LIST_MUTATION } from "@/apollo/mutations/list_mutations"
import type { InviteUserToListInput, InviteUserToListResponse } from "@/types/mutations/list_mutations_types"
import { listInvitationUserSearchFunction } from "@/data/lists/listInvitationUserSearchFunction"
import { inviteUserToListFunction } from "@/data/lists/inviteUserToListFunction"
import type { User } from "@/types/domain/user"

type Props = {
    listId: string
    setUser: (user: User | null) => void
    onClose: () => void
    currentStatus: "admin" | "member" | "owner" | null
}

const SEARCH_LIMIT = 10

export default function InviteMembersPanel({ listId, setUser, onClose, currentStatus }: Props) {

    const navigate = useNavigate()

    const [currQuery, setCurrQuery] = useState<string>("")
    const [submittedQuery, setSubmittedQuery] = useState<string>("")
    const [results, setResults] = useState<InvitableUser[]>([])
    const [pendingInviteUser, setPendingInviteUser] = useState<InvitableUser | null>(null)
    const [confirmation, setConfirmation] = useState<string | null>(null)

    // uses a list specific filter which is not worth implementing on the main search resolver
    const [searchUsers, { loading: searching }] = useLazyQuery<ListInvitationUserSearchResponse, ListInvitationUserSearchInput>(LIST_INVITATION_USER_SEARCH_QUERY, {
        fetchPolicy: "no-cache",
    })
    if (currentStatus === "member" || currentStatus === null) {
        return null
    }

    function runSearch() {
        setConfirmation(null)
        setSubmittedQuery(currQuery)
        listInvitationUserSearchFunction(
            searchUsers,
            currQuery,
            listId,
            SEARCH_LIMIT,
            navigate,
            setUser,
            setResults,
        )
    }

    function goToProfile(userId: string, e: React.MouseEvent) {
        e.stopPropagation()
        onClose()
        navigate(`/profile/${userId}`)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 arthive-fade-in">
            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Invite to list</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by username"
                        value={currQuery}
                        onChange={(e) => setCurrQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") runSearch() }}
                        className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                        type="button"
                        onClick={runSearch}
                        disabled={!currQuery.trim() || searching}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                    >
                        {searching ? "…" : "Search"}
                    </button>
                </div>

                {confirmation && (
                    <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                        {confirmation}
                    </p>
                )}

                <div className="flex flex-col divide-y divide-white/5 min-h-[8rem]">
                    {!submittedQuery && !searching && (
                        <p className="text-gray-500 text-sm text-center py-6">Search to find users to invite.</p>
                    )}
                    {submittedQuery && !searching && results.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-6">No users found.</p>
                    )}
                    {results.map(u => (
                        <div key={u.id} className="flex items-center gap-3 py-2.5">
                            <img
                                src={u.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                                alt={u.username}
                                onClick={(e) => goToProfile(u.id, e)}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            />
                            <span
                                onClick={(e) => goToProfile(u.id, e)}
                                className="flex-1 text-sm text-white truncate cursor-pointer hover:text-violet-300 transition"
                            >
                                {u.username}
                            </span>
                            <button
                                type="button"
                                onClick={() => { setConfirmation(null); setPendingInviteUser(u) }}
                                className="px-3 py-1 text-xs rounded-full border border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 transition flex-shrink-0"
                            >
                                Invite
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {pendingInviteUser && (
                <RoleConfirmPopup
                    user={pendingInviteUser}
                    currentStatus={currentStatus}
                    listId={listId}
                    setUser={setUser}
                    onCancel={() => setPendingInviteUser(null)}
                    onSent={(invitedUser) => {
                        setPendingInviteUser(null)
                        setResults(prev => prev.filter(r => r.id !== invitedUser.id))
                        setConfirmation(`Invite sent to @${invitedUser.username}`)
                    }}
                />
            )}
        </div>
    )
}

function RoleConfirmPopup({ user, listId, setUser, onCancel, onSent, currentStatus }: {
    user: InvitableUser
    listId: string
    currentStatus: "admin" | "member" | "owner"
    setUser: (u: User | null) => void
    onCancel: () => void
    onSent: (user: InvitableUser) => void
}) {
    const navigate = useNavigate()
    const [role, setRole] = useState<"member" | "admin">("member") // forced to only invite as member if not owner
    const [error, setError] = useState<string | null>(null)
    const [inviteUserToList, { loading }] = useMutation<InviteUserToListResponse, InviteUserToListInput>(INVITE_USER_TO_LIST_MUTATION)

    function send() {
        setError(null)
        inviteUserToListFunction(
            inviteUserToList,
            listId,
            user.id,
            role,
            navigate,
            setUser,
            () => onSent(user),
            (msg) => setError(msg),
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 arthive-fade-in" onClick={onCancel}>
            <div className="bg-[#171519] rounded-2xl border border-white/10 p-5 max-w-md w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close"
                        className="text-gray-400 hover:text-white text-xl leading-none transition"
                    >
                        ×
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1 pr-2 py-1">
                        <img
                            src={user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                            alt={user.username}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-sm text-white truncate max-w-[12rem]">@{user.username}</span>
                        <button
                            type="button"
                            onClick={onCancel}
                            aria-label="Remove"
                            className="text-gray-400 hover:text-white text-sm leading-none ml-1"
                        >
                            ×
                        </button>
                    </div>

                    <RoleDropdown role={role} setRole={setRole} disabled={currentStatus !== "owner"} />

                    <button
                        type="button"
                        onClick={send}
                        disabled={loading}
                        className="ml-6 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white px-4 py-1.5 rounded-full text-sm transition"
                    >
                        {loading ? "Sending…" : "Send invite"}
                    </button>
                </div>

                {error && (
                    <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}

function RoleDropdown({role, setRole, disabled}: {role: "member" | "admin", setRole: (r: "member" | "admin") => void, disabled: boolean}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const onDoc = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onDoc)
        return () => document.removeEventListener("mousedown", onDoc)
    }, [open])

    if (disabled) {
        return (
            <span className="px-3 py-1.5 text-sm rounded-full border border-white/10 text-gray-400 bg-white/5 capitalize">
                Member
            </span>
        )
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-white/10 text-gray-200 hover:bg-white/5 transition capitalize"
            >
                {role}
                <span className="text-xs text-gray-400">▼</span>
            </button>
            {open && (
                <div className="absolute top-full mt-1 right-0 bg-[#0a090c] border border-white/10 rounded-xl shadow-2xl py-1 z-10 min-w-[7rem]">
                    {(["member", "admin"] as const).map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => { setRole(r); setOpen(false) }}
                            className={
                                "w-full text-left px-3 py-1.5 text-sm capitalize transition " +
                                (role === r ? "text-violet-300 bg-violet-500/10" : "text-gray-300 hover:bg-white/5")
                            }
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

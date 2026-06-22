import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { useNavigate } from "react-router-dom"
import type { ListMemberSummary } from "../types/queries/lists_request_queries"
import {
    ALTER_LIST_MEMBERSHIP_MUTATION,
    type AlterListMembershipInput,
    type AlterListMembershipResponse,
} from "../types/mutations/alter_list_membership_mutation"
import { alterListMembershipFunction } from "../data/alter_list_membership_function"
import type { User } from "../types/user_types"

type ViewerRole = "owner" | "admin" | "member" | null
type ActionKind = "remove" | "promote" | "demote"

type Props = {
    member: ListMemberSummary
    listId: string
    currentUserRole: ViewerRole
    currentUserId: string
    setUser: (u: User | null) => void
    onChanged: (updated: ListMemberSummary | null) => void
}

export default function ListMemberActionButtons({ member, listId, currentUserRole, currentUserId, setUser, onChanged }: Props) {
    const [pendingAction, setPendingAction] = useState<ActionKind | null>(null)

    // Hard guard: no actions on yourself.
    if (member.user.id === currentUserId) return null

    // Member viewers / non-members never see action buttons.
    if (currentUserRole !== "owner" && currentUserRole !== "admin") return null

    // Admins can't touch other admins at all.
    if (currentUserRole === "admin" && member.role === "admin") return null

    const canRemove = currentUserRole === "owner" || (currentUserRole === "admin" && member.role !== "admin")
    const canPromote = currentUserRole === "owner" && member.role === "member"
    const canDemote = currentUserRole === "owner" && member.role === "admin"

    if (!canRemove && !canPromote && !canDemote) return null

    return (
        <>
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {canRemove && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPendingAction("remove") }}
                        className="px-2.5 py-0.5 text-[10px] rounded-full border border-red-500/40 text-red-300 bg-red-500/10 hover:bg-red-500/20 transition"
                    >
                        Remove
                    </button>
                )}
                {canPromote && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPendingAction("promote") }}
                        className="px-2.5 py-0.5 text-[10px] rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                    >
                        Promote
                    </button>
                )}
                {canDemote && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPendingAction("demote") }}
                        className="px-2.5 py-0.5 text-[10px] rounded-full border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition"
                    >
                        Demote
                    </button>
                )}
            </div>

            {pendingAction && (
                <ConfirmationPopup
                    kind={pendingAction}
                    member={member}
                    listId={listId}
                    setUser={setUser}
                    onCancel={() => setPendingAction(null)}
                    onSuccess={(updated) => {
                        setPendingAction(null)
                        onChanged(updated)
                    }}
                />
            )}
        </>
    )
}

function ConfirmationPopup({ kind, member, listId, setUser, onCancel, onSuccess }: {
    kind: ActionKind
    member: ListMemberSummary
    listId: string
    setUser: (u: User | null) => void
    onCancel: () => void
    onSuccess: (updated: ListMemberSummary | null) => void
}) {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [alterListMembership, { loading }] = useMutation<AlterListMembershipResponse, AlterListMembershipInput>(ALTER_LIST_MEMBERSHIP_MUTATION)

    const description =
        kind === "remove" ? `Remove @${member.user.username} from this list?` :
        kind === "promote" ? `Promote @${member.user.username} to admin?` :
        `Demote @${member.user.username} to member?`

    const confirmLabel =
        kind === "remove" ? "Remove" :
        kind === "promote" ? "Promote" :
        "Demote"

    const confirmClass =
        kind === "remove"
            ? "bg-red-500 hover:bg-red-400"
            : kind === "promote"
            ? "bg-emerald-500 hover:bg-emerald-400"
            : "bg-amber-500 hover:bg-amber-400"

    function confirm() {
        setError(null)
        const action: "remove" | "change_role" = kind === "remove" ? "remove" : "change_role"
        const role: "member" | "admin" | null =
            kind === "promote" ? "admin" : kind === "demote" ? "member" : null

        alterListMembershipFunction(
            alterListMembership,
            member.id,
            listId,
            action,
            role,
            navigate,
            setUser,
            (updatedMember) => {
                if (kind === "remove") {
                    onSuccess(null)
                } else {
                    onSuccess({ ...member, role: updatedMember.role as "member" | "admin" })
                }
            },
            (msg) => setError(msg),
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 arthive-fade-in" onClick={onCancel}>
            <div className="bg-[#171519] rounded-2xl border border-white/10 p-6 max-w-sm w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <img
                        src={member.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                        alt={member.user.username}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm text-gray-400 capitalize">{kind}</span>
                        <span className="text-base text-white font-medium truncate">@{member.user.username}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{description}</p>

                {error && (
                    <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-1.5 rounded-full text-sm transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={loading}
                        className={`${confirmClass} disabled:opacity-50 text-white px-4 py-1.5 rounded-full text-sm transition`}
                    >
                        {loading ? "Working…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

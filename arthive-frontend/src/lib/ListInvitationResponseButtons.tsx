import { useMutation } from "@apollo/client/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    RESPOND_TO_LIST_INVITE_MUTATION,
    type RespondToListInviteInput,
    type RespondToListInviteResponse,
} from "../types/mutations/respond_to_list_invite_mutation"
import { respondToListInviteFunction } from "../data/respond_to_list_invite_function"
import type { User } from "../types/user_types"

type Props = {
    listMember: {
        id: string
        status: string
        list: { id: string, name: string }
    }
    setUser: (u: User | null) => void
    onResponded?: () => void
}

export default function ListInvitationResponseButtons({ listMember, setUser, onResponded }: Props) {
    const navigate = useNavigate()
    const [status, setStatus] = useState<string>(listMember.status)
    const [respondToListInvite, { loading }] = useMutation<RespondToListInviteResponse, RespondToListInviteInput>(RESPOND_TO_LIST_INVITE_MUTATION)

    if (status !== "pending") return null // once accepted or rejected, don't show the buttons

    function handle(accept: boolean, e: React.MouseEvent) {
        e.stopPropagation()
        if (loading) return
        respondToListInviteFunction(
            respondToListInvite,
            listMember.id,
            accept,
            navigate,
            setUser,
            (next) => setStatus(next ?? (accept ? "accepted" : "rejected")),
        )
        onResponded?.()
    }

    return (
        <div className="flex gap-2 mt-2">
            <button
                onClick={(e) => handle(true, e)}
                disabled={loading}
                className="px-3 py-1 text-xs rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 transition disabled:opacity-50"
            >
                Accept
            </button>
            <button
                onClick={(e) => handle(false, e)}
                disabled={loading}
                className="px-3 py-1 text-xs rounded-full border bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25 transition disabled:opacity-50"
            >
                Reject
            </button>
        </div>
    )
}

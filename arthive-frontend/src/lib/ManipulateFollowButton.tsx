import { useNavigate } from "react-router-dom"
import type { ManipulateFollowInput, ManipulateFollowResponse } from "../types/mutations/follow_mutations"
import { useMutation } from "@apollo/client/react"
import { MANIPULATE_FOLLOW_MUTATION } from "../types/mutations/follow_mutations"
import { manipulateFollowRequest } from "../data/manipulate_follow_request"
import type { User } from "../types/user_types"

const MANIPULATION_STYLES: Record<"accept" | "reject" | "unfollow" | "cancel", string> = {
    accept: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25",
    reject: "bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25",
    unfollow: "border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white",
    cancel: "border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white",
}

const MANIPULATION_LABELS: Record<"accept" | "reject" | "unfollow" | "cancel", string> = {
    accept: "Accept",
    reject: "Reject",
    unfollow: "Unfollow",
    cancel: "Cancel",
}

export default function ManipulateFollowButton({followId, manipulation, setFollowStatus, setUser, obtainFollowsDetails}: {followId: string, manipulation: "accept" | "reject" | "unfollow" | "cancel", setFollowStatus: (followStatus:{id: string, status: string} | null) => void, setUser: (user: User) => void, obtainFollowsDetails?: () => void}) {
    const [manipulateFollow] = useMutation<ManipulateFollowResponse, ManipulateFollowInput>(MANIPULATE_FOLLOW_MUTATION)
    const navigate = useNavigate()

    function handleManipulateFollow() {
        manipulateFollowRequest(manipulateFollow, followId, manipulation.toLowerCase(), navigate, setFollowStatus, setUser, obtainFollowsDetails)
    }
    return (
        <button
            onClick={() => handleManipulateFollow()}
            className={`px-4 py-1.5 rounded-full text-sm transition ${MANIPULATION_STYLES[manipulation]}`}
        >
            {MANIPULATION_LABELS[manipulation]}
        </button>
    )
}
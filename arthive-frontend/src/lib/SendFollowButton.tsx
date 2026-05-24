import { useMutation } from "@apollo/client/react"
import { type SendFollowInput, type SendFollowResponse, SEND_FOLLOW_MUTATION } from "../types/mutations/follow_mutations"
import { useNavigate } from "react-router-dom"
import { sendFollowRequest } from "../data/send_follow_request"
import type { User } from "../types/user_types"

export default function SendFollowButton({receiverId, setUser, setCurrOutgoingFollowStatus}: {receiverId: string, setUser: (user: User) => void, setCurrOutgoingFollowStatus: (currOutgoingFollowStatus: {id: string, status: string} | null) => void}) {
    const [sendFollow] = useMutation<SendFollowResponse, SendFollowInput>(SEND_FOLLOW_MUTATION)
    const navigate = useNavigate()

    function handleFollow() {
        sendFollowRequest(sendFollow, receiverId, navigate, setUser, setCurrOutgoingFollowStatus)
    }
    return (
        <button
            onClick={() => handleFollow()}
            className="bg-violet-500 hover:bg-violet-400 text-white px-4 py-1.5 rounded-full text-sm transition"
        >
            Follow
        </button>
    )
}
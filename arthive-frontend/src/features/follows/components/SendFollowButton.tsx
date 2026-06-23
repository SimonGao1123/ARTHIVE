import { useMutation } from "@apollo/client/react"
import { SEND_FOLLOW_MUTATION } from "@/apollo/mutations/follow_mutations"
import type { SendFollowInput, SendFollowResponse } from "@/types/mutations/follow_mutations_types"
import { useNavigate } from "react-router-dom"
import { sendFollowRequest } from "@/data/user/sendFollowRequest"
import type { User } from "@/types/domain/user"

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
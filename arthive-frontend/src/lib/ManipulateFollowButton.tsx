import { useNavigate } from "react-router-dom"
import type { ManipulateFollowInput, ManipulateFollowResponse } from "../types/mutations/follow_mutations"
import { useMutation } from "@apollo/client/react"
import { MANIPULATE_FOLLOW_MUTATION } from "../types/mutations/follow_mutations"
import { manipulateFollowRequest } from "../data/manipulate_follow_request"
import type { User } from "../types/user_types"
export default function ManipulateFollowButton({followId, manipulation, setFollowStatus, setUser}: {followId: string, manipulation: "accept" | "reject" | "unfollow" | "cancel", setFollowStatus: (followStatus:{id: string, status: string} | null) => void, setUser: (user: User) => void}) { 
    const [manipulateFollow] = useMutation<ManipulateFollowResponse, ManipulateFollowInput>(MANIPULATE_FOLLOW_MUTATION)
    const navigate = useNavigate()

    function handleManipulateFollow() {
        manipulateFollowRequest(manipulateFollow, followId, manipulation.toLowerCase(), navigate, setFollowStatus, setUser)
    }
    return (
        <button onClick={() => handleManipulateFollow()}>{manipulation}</button>
    )
}
import type { User } from "../types/user_types"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { FollowData, ObtainFollowersInput, ObtainFollowersResponse } from "../types/queries/obtain_followers_query"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_INCOMING_FOLLOWS_QUERY, OBTAIN_OUTGOING_FOLLOWS_QUERY } from "../types/queries/obtain_followers_query"
import { obtainFollowsDetailsFunction } from "../data/obtain_follows_details"
import ManipulateFollowButton from "../lib/ManipulateFollowButton"

type UserFollowDetailsProps = {
    setUser: (user: User | null) => void,
    user: User | null
}

const LIMIT = 1
const VALID_FOLLOW_TYPES = ["followers", "following", "pending_sent_follows", "pending_received_follows"]

export default function UserFollowDetails({ setUser, user }: UserFollowDetailsProps) {
    const {follow_type, id} = useParams()

    const [pageNum, setPageNum] = useState(1)

    const [followsData, setFollowsData] = useState<FollowData[]>([])
    const [userData, setUserData] = useState<{id: string, username: string, profilePicture: string} | null>(null)
    const [count, setCount] = useState<number>(0)
    const [ifNextPage, setIfNextPage] = useState(true)

    const [obtainFollowersQuery, {loading, error}] = useLazyQuery<ObtainFollowersResponse, ObtainFollowersInput>
    (follow_type === "followers" || follow_type === "pending_received_follows" ? OBTAIN_INCOMING_FOLLOWS_QUERY : OBTAIN_OUTGOING_FOLLOWS_QUERY)

    const navigate = useNavigate()
    useEffect(() => {
        if (!VALID_FOLLOW_TYPES.includes(follow_type as string)) {
            navigate("/*")
        }
        obtainFollowsDetailsFunction(id as string, pageNum, LIMIT, follow_type as "followers" | "following" | "pending_sent_follows" | "pending_received_follows", obtainFollowersQuery, setFollowsData, setUserData, setCount, navigate, setUser, setIfNextPage)

    }, [pageNum])

    console.log("followsData", followsData)
    console.log("userData", userData)
    console.log("count", count)
    console.log("ifNextPage", ifNextPage)
    return (
        <div>
            {loading ? <div>Loading...</div> : <></>}
            {error ? <div>Error: {error.message}</div> : <></>}
            
            <h2>{userData?.username}'s {follow_type} - ({count})</h2>

            <p>=====================================================</p>
            <div>
                {followsData.map((follow) => (
                    <UserFollowCard key={follow.id} follow={follow} follow_type={follow_type as "followers" | "following" | "pending_sent_follows" | "pending_received_follows"} setUser={setUser} id={id as string} setFollowsData={setFollowsData} setCount={setCount} />
                ))}
            </div>

            {ifNextPage && <button onClick={() => setPageNum((prev: number) => prev + 1)}>Load More</button>}
        </div>
    )
}

type UserFollowCardProps = {
    follow: FollowData
    follow_type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows"
    setUser: (user: User | null) => void
    id: string
    setFollowsData: (followsData: FollowData[]) => void
    setCount: (count: number) => void
}
export function UserFollowCard({follow, follow_type, setUser, id, setFollowsData, setCount}: UserFollowCardProps) {
    const [currFollowStatus, setCurrFollowStatus] = useState<{id: string, status: string} | null>({id: follow.id, status: follow.status})

    useEffect(() => {
        if (currFollowStatus?.status === "accepted" && (follow_type === "following" || follow_type === "followers")) {
            return
        }
        if (currFollowStatus?.status === "pending" && (follow_type === "pending_sent_follows" || follow_type === "pending_received_follows")) {
            return
        }

        // remove the follow from the followsData if it no long satisfies the follow_type of the page
        setFollowsData((prev: FollowData[]) => prev.filter((curr_follow) => curr_follow.id !== follow.id))
        setCount((prev: number) => prev - 1)
    }, [currFollowStatus])

    const FollowManipulationButton = () => {
        if (follow_type === "pending_received_follows") {
            return ( 
            <>
            <ManipulateFollowButton followId={follow.id} manipulation="accept" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
            <ManipulateFollowButton followId={follow.id} manipulation="reject" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
            </> )
        } else if (follow_type === "pending_sent_follows") {
            return (
            <>
            <ManipulateFollowButton followId={follow.id} manipulation="cancel" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
            </>
            )
        } else {
            return <ManipulateFollowButton followId={follow.id} manipulation="unfollow" setFollowStatus={setCurrFollowStatus} setUser={setUser} />

        }
    }
    return (
        <div>
            {follow.sender ? 
            <div>{follow.sender.username}</div> 
            
            : 
            <div>{follow.receiver?.username}</div>
            
            }
            <img width={50} height={50} src={follow.sender?.profilePicture || follow.receiver?.profilePicture || "/default-ARTHIVE-pfp.png"} alt={follow.sender?.username || follow.receiver?.username} />
            <div>{currFollowStatus?.status ?? "No status"}</div>
            <div>{follow.updatedAt}</div>
            <FollowManipulationButton />
            <p>=====================================================</p>
        </div>
    )
}
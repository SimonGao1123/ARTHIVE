import type { User } from "../types/user_types"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { FollowData, ObtainFollowersInput, ObtainFollowersResponse } from "../types/queries/obtain_followers_query"
import { useLazyQuery } from "@apollo/client/react"
import { OBTAIN_INCOMING_FOLLOWS_QUERY, OBTAIN_OUTGOING_FOLLOWS_QUERY } from "../types/queries/obtain_followers_query"
import { obtainFollowsDetailsFunction } from "../data/obtain_follows_details"
import ManipulateFollowButton from "../lib/ManipulateFollowButton"
import { NumberedPagination } from "../lib/NumberedPagination"
type UserFollowDetailsProps = {
    setUser: (user: User | null) => void,
    user: User | null
}

const LIMIT = 2
const VALID_FOLLOW_TYPES = ["followers", "following", "pending_sent_follows", "pending_received_follows"]

export default function UserFollowDetails({ setUser, user }: UserFollowDetailsProps) {
    const {follow_type, id} = useParams()

    const [pageNum, setPageNum] = useState(1)

    const [followsData, setFollowsData] = useState<FollowData[]>([])
    const [targetUserData, setTargetUserData] = useState<{id: string, username: string, profilePicture: string} | null>(null)
    const [count, setCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)

    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")


    const [obtainFollowersQuery, {loading, error}] = useLazyQuery<ObtainFollowersResponse, ObtainFollowersInput>
    (follow_type === "followers" || follow_type === "pending_received_follows" ? OBTAIN_INCOMING_FOLLOWS_QUERY : OBTAIN_OUTGOING_FOLLOWS_QUERY)

    const navigate = useNavigate()
    useEffect(() => {
        if (!VALID_FOLLOW_TYPES.includes(follow_type as string)) {
            navigate("/*")
        }
        obtainFollowsDetailsFunction(id as string, setTotalPages, query, LIMIT, follow_type as "followers" | "following" | "pending_sent_follows" | "pending_received_follows", obtainFollowersQuery, setFollowsData, setTargetUserData, setCount, navigate, setUser, pageNum)

    }, [pageNum, query])

    return (
        <div>
            {loading ? <div>Loading...</div> : <></>}
            {error ? <div>Error: {error.message}</div> : <></>}
            
            <h2>{targetUserData?.username}'s {follow_type} - ({count})</h2>

            <input type="text" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
            <button disabled={query === currQuery} onClick={() => setQuery(currQuery)}>Search</button>
            <p>=====================================================</p>
            <div>
                {followsData.map((follow) => (
                    <UserFollowCard key={follow.id} user={user} follow={follow} follow_type={follow_type as "followers" | "following" | "pending_sent_follows" | "pending_received_follows"} setUser={setUser} id={id as string} setFollowsData={setFollowsData} setCount={setCount} />
                ))}
            </div>

            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

type UserFollowCardProps = {
    user: User | null
    follow: FollowData
    follow_type: "followers" | "following" | "pending_sent_follows" | "pending_received_follows"
    setUser: (user: User | null) => void
    id: string
    setFollowsData: (followsData: FollowData[]) => void
    setCount: (count: number) => void
}
export function UserFollowCard({user, follow, follow_type, setUser, id, setFollowsData, setCount}: UserFollowCardProps) {
    const [currFollowStatus, setCurrFollowStatus] = useState<{id: string, status: string} | null>({id: follow.id, status: follow.status})
    const navigate = useNavigate()
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
            <div onClick={() => navigate(`/profile/${follow.sender?.id}`)}>{follow.sender?.username}</div> 
            
            : 
            <div onClick={() => navigate(`/profile/${follow.receiver?.id}`)}>{follow.receiver?.username}</div>
            }
            <img width={50} height={50} src={follow.sender?.profilePicture ? follow.sender?.profilePicture : follow.receiver?.profilePicture ? follow.receiver?.profilePicture : "/default-ARTHIVE-pfp.png"} alt={follow.sender?.username ? follow.sender?.username : follow.receiver?.username ? follow.receiver?.username : "Profile Picture"} />
            <div>{currFollowStatus?.status ?? "No status"}</div>
            <div>{follow.updatedAt}</div>
            {Number(user?.id) === Number(id) ? <FollowManipulationButton /> : <></>}
            <p>=====================================================</p>
        </div>
    )
}
import React, { useState, useEffect } from "react"
import type { User } from "../types/user_types"
import { useParams, useNavigate } from "react-router-dom"
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

const FOLLOW_TYPE_LABEL: Record<string, string> = {
    followers: "Followers",
    following: "Following",
    pending_sent_follows: "Pending Sent",
    pending_received_follows: "Pending Received",
}

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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {targetUserData?.username ? `${targetUserData.username}'s ` : ""}
                    {FOLLOW_TYPE_LABEL[follow_type ?? ""] ?? follow_type}
                    <span className="text-gray-400 font-normal text-lg ml-2">({count})</span>
                </h1>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search"
                    value={currQuery}
                    onChange={(e) => setCurrQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") setQuery(currQuery) }}
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
                <button
                    disabled={query === currQuery}
                    onClick={() => setQuery(currQuery)}
                    className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                >
                    Search
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {error.message}
                </div>
            )}
            {loading && <div className="text-gray-400 text-sm">Loading…</div>}

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6">
                {followsData.length === 0 && !loading ? (
                    <p className="text-gray-500 text-sm text-center py-4">No results found.</p>
                ) : (
                    followsData.map((follow) => (
                        <UserFollowCard
                            key={follow.id}
                            user={user}
                            follow={follow}
                            follow_type={follow_type as "followers" | "following" | "pending_sent_follows" | "pending_received_follows"}
                            setUser={setUser}
                            id={id as string}
                            setFollowsData={setFollowsData}
                            setCount={setCount}
                        />
                    ))
                )}
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
    setFollowsData: React.Dispatch<React.SetStateAction<FollowData[]>>
    setCount: React.Dispatch<React.SetStateAction<number>>
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

        setFollowsData((prev: FollowData[]) => prev.filter((curr_follow) => curr_follow.id !== follow.id))
        setCount((prev: number) => prev - 1)
    }, [currFollowStatus])

    const profilePicture = follow.sender?.profilePicture ?? follow.receiver?.profilePicture ?? "/default-ARTHIVE-pfp.png"
    const username = follow.sender?.username ?? follow.receiver?.username ?? "Unknown"
    const otherUserId = follow.sender?.id ?? follow.receiver?.id

    const statusChip = currFollowStatus?.status === "accepted"
        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
        : "border-amber-500/40 text-amber-300 bg-amber-500/10"

    const FollowManipulationButton = () => {
        if (follow_type === "pending_received_follows") {
            return (
                <>
                    <ManipulateFollowButton followId={follow.id} manipulation="accept" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
                    <ManipulateFollowButton followId={follow.id} manipulation="reject" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
                </>
            )
        } else if (follow_type === "pending_sent_follows") {
            return <ManipulateFollowButton followId={follow.id} manipulation="cancel" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
        } else {
            return <ManipulateFollowButton followId={follow.id} manipulation="unfollow" setFollowStatus={setCurrFollowStatus} setUser={setUser} />
        }
    }

    return (
        <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-b-0">
            <img
                width={40}
                height={40}
                src={profilePicture}
                alt={username}
                onClick={() => navigate(`/profile/${otherUserId}`)}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
            />

            <div className="flex-1 min-w-0">
                <p
                    onClick={() => navigate(`/profile/${otherUserId}`)}
                    className="text-white font-medium hover:text-violet-300 cursor-pointer transition truncate"
                >
                    {username}
                </p>
                <p className="text-xs text-gray-500">
                    {new Date(follow.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusChip}`}>
                {currFollowStatus?.status ?? "—"}
            </span>

            {Number(user?.id) === Number(id) && (
                <div className="flex gap-2 flex-shrink-0">
                    <FollowManipulationButton />
                </div>
            )}
        </div>
    )
}

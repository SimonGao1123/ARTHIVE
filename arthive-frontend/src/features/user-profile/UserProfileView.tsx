import { useEffect, useState } from "react"
import { USER_PROFILE_QUERY } from "@/apollo/queries/user_queries"
import type { UserProfileQueryInput, UserProfileType, UserProfileQueryResponse } from "@/types/queries/user_queries_types"
import type { User } from "@/types/domain/user"
import { useLazyQuery } from "@apollo/client/react"
import { ObtainUserProfileFetch } from "@/data/user/obtainUserProfile"
import { useNavigate, useParams } from "react-router-dom"
import SendFollowButton from "@/features/follows/components/SendFollowButton"
import ManipulateFollowButton from "@/features/follows/components/ManipulateFollowButton"
import RecentUserActivity from "@/features/user-profile/components/RecentUserActivity"

type UserProfilePageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function UserProfilePage({ setUser, user }: UserProfilePageProps) {
    const navigate = useNavigate()
    const { id } = useParams()
    const [userProfileData, setUserProfileData] = useState<UserProfileType | null>(null)
    const [getUserProfile, { loading, error }] = useLazyQuery<UserProfileQueryResponse, UserProfileQueryInput>(USER_PROFILE_QUERY, { fetchPolicy: "no-cache" })
    const [currIncomingFollowStatus, setCurrIncomingFollowStatus] = useState<{id: string, status: string} | null>(null)
    const [currOutgoingFollowStatus, setCurrOutgoingFollowStatus] = useState<{id: string, status: string} | null>(null)

    useEffect(() => {
        ObtainUserProfileFetch(getUserProfile, setUserProfileData, id!, setUser, navigate)
    }, [user?.id, id])

    useEffect(() => {
        if (userProfileData) {
            setCurrIncomingFollowStatus(userProfileData.currentIncomingFollow ?? null)
            setCurrOutgoingFollowStatus(userProfileData.currentOutgoingFollow ?? null)
        }
    }, [userProfileData])

    const isOwnProfile = id === user?.id

    return (
        <div className="flex flex-col gap-6">
            {error && <p className="text-red-400 text-sm">{error.message}</p>}
            {loading && <p className="text-gray-400 text-sm">Loading…</p>}

            {userProfileData && (
                <>
                    {/* Profile card */}
                    <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
                        <div className="flex items-start gap-5">
                            <img
                                src={userProfileData.user.profilePicture ?? "/default-ARTHIVE-pfp.png"}
                                alt="Profile Picture"
                                className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
                            />
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-white">{userProfileData.user.username}</h1>
                                    <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                                        {userProfileData.user.visibility === "public" ? "Public" : "Private"}
                                    </span>
                                </div>
                                {userProfileData.user.description && (
                                    <p className="text-sm text-gray-400 leading-relaxed">{userProfileData.user.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-1">
                                    <button
                                        onClick={() => navigate(`/profile/followers/${id}`)}
                                        className="text-sm text-gray-400 hover:text-white transition"
                                    >
                                        <span className="font-semibold text-white">{userProfileData.user.followersCount}</span> followers
                                    </button>
                                    <button
                                        onClick={() => navigate(`/profile/following/${id}`)}
                                        className="text-sm text-gray-400 hover:text-white transition"
                                    >
                                        <span className="font-semibold text-white">{userProfileData.user.followingCount}</span> following
                                    </button>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/edit_profile")}
                                    className="text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition flex-shrink-0"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {!isOwnProfile && user && (
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                                <OutgoingFollowButton
                                    profileId={id!}
                                    currOutgoingFollowStatus={currOutgoingFollowStatus}
                                    setCurrOutgoingFollowStatus={setCurrOutgoingFollowStatus}
                                    setUser={setUser}
                                />
                                <IncomingFollowButton
                                    currIncomingFollowStatus={currIncomingFollowStatus}
                                    setCurrIncomingFollowStatus={setCurrIncomingFollowStatus}
                                    setUser={setUser}
                                />
                            </div>
                        )}

                        {(userProfileData.user.pendingSentFollowsCount != null || userProfileData.user.pendingReceivedFollowsCount != null) && (
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                {userProfileData.user.pendingSentFollowsCount != null && (
                                    <button
                                        onClick={() => navigate(`/profile/pending_sent_follows/${id}`)}
                                        className="text-xs text-amber-400 hover:text-amber-300 transition"
                                    >
                                        {userProfileData.user.pendingSentFollowsCount} pending sent
                                    </button>
                                )}
                                {userProfileData.user.pendingReceivedFollowsCount != null && (
                                    <button
                                        onClick={() => navigate(`/profile/pending_received_follows/${id}`)}
                                        className="text-xs text-amber-400 hover:text-amber-300 transition"
                                    >
                                        {userProfileData.user.pendingReceivedFollowsCount} pending received
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    {userProfileData.isVisibleToUser && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {([
                                { label: "Reviews", value: userProfileData.totalReviewsCount, path: `/all_reviews/${id}` },
                                { label: "All Logged", value: userProfileData.allFinishedCount, path: `/finished/${id}` },
                                { label: "Liked", value: userProfileData.allLikedCount, path: `/liked/${id}` },
                                { label: "Lists", value: userProfileData.totalListsCount, path: `/all_lists/${id}` },
                                { label: "Threads", value: userProfileData.totalCommunityThreadsCount, path: undefined },
                                { label: "Film Reviews", value: userProfileData.filmReviewsCount, path: undefined },
                                { label: "Series Reviews", value: userProfileData.seriesReviewsCount, path: undefined },
                                { label: "Book Reviews", value: userProfileData.bookReviewsCount, path: undefined },
                                { label: "Game Reviews", value: userProfileData.gameReviewsCount, path: undefined },
                            ] as { label: string; value: number | null; path?: string }[])
                                .filter(s => s.value != null)
                                .map((stat) => (
                                    <div
                                        key={stat.label}
                                        onClick={() => stat.path && navigate(stat.path)}
                                        className={`bg-[#171519] border border-white/5 rounded-xl p-4 flex flex-col gap-1 ${stat.path ? "hover:border-violet-500/30 hover:bg-white/[0.03] transition cursor-pointer" : ""}`}
                                    >
                                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                                        <span className="text-xs text-gray-400">{stat.label}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Activity */}
                    {userProfileData.isVisibleToUser && user && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Recent Activity</p>
                            <RecentUserActivity targetUserId={id!} setUser={setUser} navigate={navigate} />
                        </div>
                    )}

                    {!userProfileData.isVisibleToUser && (
                        <div className="bg-[#171519] rounded-2xl border border-white/5 p-8 text-center">
                            <p className="text-gray-400 text-sm">This profile is private.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

type IncomingFollowButtonProps = {
    currIncomingFollowStatus: {id: string, status: string} | null
    setCurrIncomingFollowStatus: (s: {id: string, status: string} | null) => void
    setUser: (user: User) => void
}
function IncomingFollowButton({currIncomingFollowStatus, setCurrIncomingFollowStatus, setUser}: IncomingFollowButtonProps) {
    if (!currIncomingFollowStatus) return null
    if (currIncomingFollowStatus.status === "pending") {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Sent you a follow request</span>
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="accept" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="reject" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    if (currIncomingFollowStatus.status === "accepted") {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Follows you</span>
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="unfollow" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    return null
}

type OutgoingFollowButtonProps = {
    profileId: string
    currOutgoingFollowStatus: {id: string, status: string} | null
    setCurrOutgoingFollowStatus: (s: {id: string, status: string} | null) => void
    setUser: (user: User) => void
}
function OutgoingFollowButton({profileId, currOutgoingFollowStatus, setCurrOutgoingFollowStatus, setUser}: OutgoingFollowButtonProps) {
    if (!currOutgoingFollowStatus) {
        return <SendFollowButton receiverId={profileId} setUser={setUser} setCurrOutgoingFollowStatus={setCurrOutgoingFollowStatus} />
    }
    if (currOutgoingFollowStatus.status === "pending") {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Request pending</span>
                <ManipulateFollowButton followId={currOutgoingFollowStatus.id} manipulation="cancel" setFollowStatus={setCurrOutgoingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    if (currOutgoingFollowStatus.status === "accepted") {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Following</span>
                <ManipulateFollowButton followId={currOutgoingFollowStatus.id} manipulation="unfollow" setFollowStatus={setCurrOutgoingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    return null
}

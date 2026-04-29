import { useEffect, useState } from "react"
import { USER_PROFILE_QUERY, type UserProfileQueryInput, type UserProfileType, type UserProfileQueryResponse } from "../types/queries/user_profile_query"
import type { User } from "../types/user_types"
import { useLazyQuery } from "@apollo/client/react"
import { ObtainUserProfileFetch } from "../data/obtain_user_profile"
import { useNavigate, useParams } from "react-router-dom"
import SendFollowButton from "../lib/SendFollowButton"
import ManipulateFollowButton from "../lib/ManipulateFollowButton"

type UserProfilePageProps = {
    setUser: (user: User | null) => void,
    user: User | null
}

export default function UserProfilePage({ setUser, user }: UserProfilePageProps) {
    const navigate = useNavigate()
    const { id } = useParams()
    const [userProfileData, setUserProfileData] = useState<UserProfileType | null>(null)
    const [getUserProfile, { loading, error}] = useLazyQuery<UserProfileQueryResponse, UserProfileQueryInput>(USER_PROFILE_QUERY, {
        fetchPolicy: "no-cache",
    })
    
    const [currIncomingFollowStatus, setCurrIncomingFollowStatus] = useState<{id: string, status: string} | null>(null)
    const [currOutgoingFollowStatus, setCurrOutgoingFollowStatus] = useState<{id: string, status: string} | null>(null)
    useEffect(() => {
        ObtainUserProfileFetch(getUserProfile, setUserProfileData, id!, setUser, navigate)
    }, [user?.id])

    useEffect(() => {
        if (userProfileData) {
            setCurrIncomingFollowStatus(userProfileData.currentIncomingFollow ?? null)
            setCurrOutgoingFollowStatus(userProfileData.currentOutgoingFollow ?? null)
        }
    }, [userProfileData])
    console.log(userProfileData)
    console.log(currIncomingFollowStatus)
    console.log(currOutgoingFollowStatus)
    return (
        <div>
            {error?.message}
            {loading ? <p>"Loading..."</p> : <></>}
            <img width={50} height={50} src={userProfileData?.user?.profilePicture ? userProfileData?.user?.profilePicture : "/default-ARTHIVE-pfp.png"} alt="Profile Picture" className="profile-picture" />
            <h1>{userProfileData?.user?.username} 's Profile - {userProfileData?.user?.visibility === "public" ? "Public" : "Private"}</h1>
            {userProfileData?.user?.description ? <p>Description: {userProfileData?.user?.description}</p> : <></>}
            <p>Followers: {userProfileData?.user?.followersCount}</p>
            <p>Following: {userProfileData?.user?.followingCount}</p>
            {userProfileData?.user?.pendingSentFollowsCount !== null ? <p>Pending Sent Follows: {userProfileData?.user?.pendingSentFollowsCount}</p> : <></>}
            {userProfileData?.user?.pendingReceivedFollowsCount !== null ? <p>Pending Received Follows: {userProfileData?.user?.pendingReceivedFollowsCount}</p> : <></>}
            <p>Visibility: {userProfileData?.isVisibleToUser ? "Can View" : "Private"}</p>
            
            {
            id !== user?.id &&
            <>
                <OutgoingFollowButton profileId={id!} currOutgoingFollowStatus={currOutgoingFollowStatus} setCurrOutgoingFollowStatus={setCurrOutgoingFollowStatus} setUser={setUser} />
                <IncomingFollowButton currIncomingFollowStatus={currIncomingFollowStatus} setCurrIncomingFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
            </>
            }
            {userProfileData?.totalReviewsCount !== null ? <p>Total Reviews: {userProfileData?.totalReviewsCount}</p> : <></>}
            {userProfileData?.allFinishedCount !== null ? <p>All Finished: {userProfileData?.allFinishedCount}</p> : <></>}
            {userProfileData?.filmFinishedCount !== null ? <p>Film Finished: {userProfileData?.filmFinishedCount}</p> : <></>}
            {userProfileData?.seriesFinishedCount !== null ? <p>Series Finished: {userProfileData?.seriesFinishedCount}</p> : <></>}
            {userProfileData?.bookFinishedCount !== null ? <p>Book Finished: {userProfileData?.bookFinishedCount}</p> : <></>}
            {userProfileData?.gameFinishedCount !== null ? <p>Game Finished: {userProfileData?.gameFinishedCount}</p> : <></>}
        </div>
    )
}

type IncomingFollowButtonProps = {
    currIncomingFollowStatus: {id: string, status: string} | null,
    setCurrIncomingFollowStatus: (currIncomingFollowStatus: {id: string, status: string} | null) => void
    setUser: (user: User) => void
}
function IncomingFollowButton({currIncomingFollowStatus, setCurrIncomingFollowStatus, setUser}: IncomingFollowButtonProps) {
    if (!currIncomingFollowStatus) {
        
        return <></>
    }
    else if (currIncomingFollowStatus.status === "pending") {
        return (
            <div>
                <p>User sent you a follow request</p>
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="accept" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="reject" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    else if (currIncomingFollowStatus.status === "accepted") {
        return (
            <div>
                <p>You are following this user</p>
                <ManipulateFollowButton followId={currIncomingFollowStatus.id} manipulation="unfollow" setFollowStatus={setCurrIncomingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    
}

type OutgoingFollowButtonProps = {
    profileId: string,
    currOutgoingFollowStatus: {id: string, status: string} | null,
    setCurrOutgoingFollowStatus: (currOutgoingFollowStatus: {id: string, status: string} | null) => void
    setUser: (user: User) => void
}
function OutgoingFollowButton({profileId, currOutgoingFollowStatus, setCurrOutgoingFollowStatus, setUser}: OutgoingFollowButtonProps) {
    if (!currOutgoingFollowStatus) {
        return <SendFollowButton receiverId={profileId!} setUser={setUser} setCurrOutgoingFollowStatus={setCurrOutgoingFollowStatus} />
    }
    else if (currOutgoingFollowStatus.status === "pending") {
        return (
            <div>
                <p>You sent a follow request to this user</p>
                <ManipulateFollowButton followId={currOutgoingFollowStatus.id} manipulation="cancel" setFollowStatus={setCurrOutgoingFollowStatus} setUser={setUser} />
            </div>
        )
    }
    else if (currOutgoingFollowStatus.status === "accepted") {
        return (
            <div>
                <p>You are following this user</p>
                <ManipulateFollowButton followId={currOutgoingFollowStatus.id} manipulation="unfollow" setFollowStatus={setCurrOutgoingFollowStatus} setUser={setUser} />
            </div>
        )
    }
}
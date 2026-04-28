import { useEffect, useState } from "react"
import { USER_PROFILE_QUERY, type UserProfileQueryInput, type UserProfileType, type UserProfileQueryResponse } from "../types/queries/user_profile_query"
import type { User } from "../types/user_types"
import { useLazyQuery } from "@apollo/client/react"
import { ObtainUserProfileFetch } from "../data/obtain_user_profile"
import { useNavigate, useParams } from "react-router-dom"
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
    
    useEffect(() => {
        ObtainUserProfileFetch(getUserProfile, setUserProfileData, id!, setUser, navigate)
    }, [user?.id])
    console.log(userProfileData)
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
            
            <p>Current Outgoing Follow: {userProfileData?.currentOutgoingFollow ? userProfileData?.currentOutgoingFollow.status : "None"}</p>
            <p>Current Incoming Follow: {userProfileData?.currentIncomingFollow ? userProfileData?.currentIncomingFollow.status : "None"}</p>
            {userProfileData?.totalReviewsCount !== null ? <p>Total Reviews: {userProfileData?.totalReviewsCount}</p> : <></>}
            {userProfileData?.allFinishedCount !== null ? <p>All Finished: {userProfileData?.allFinishedCount}</p> : <></>}
            {userProfileData?.filmFinishedCount !== null ? <p>Film Finished: {userProfileData?.filmFinishedCount}</p> : <></>}
            {userProfileData?.seriesFinishedCount !== null ? <p>Series Finished: {userProfileData?.seriesFinishedCount}</p> : <></>}
            {userProfileData?.bookFinishedCount !== null ? <p>Book Finished: {userProfileData?.bookFinishedCount}</p> : <></>}
        </div>
    )
}
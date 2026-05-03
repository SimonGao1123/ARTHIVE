import { gql } from "@apollo/client";

export const USER_PROFILE_QUERY = gql`
    query UserProfile($userId: ID!) {
        obtainUserProfile(userId: $userId) {
            user {
                id
                username
                visibility
                profilePicture
                description
                followersCount
                followingCount
                pendingSentFollowsCount
                pendingReceivedFollowsCount
            }
            isVisibleToUser
            currentOutgoingFollow {
                id
                status
            }
            currentIncomingFollow {
                id
                status
            }
            totalReviewsCount
            allFinishedCount
            filmFinishedCount
            seriesFinishedCount
            bookFinishedCount
            gameFinishedCount
            editAccess
        }
    }
`

export type UserProfileQueryInput = {
    userId: string,
}
export type UserProfileQueryResponse = {
    obtainUserProfile: UserProfileType,
}

export type UserProfileType = {
    user: {
        id: string,
        username: string,
        visibility: string,
        profilePicture: string | null,
        description: string | null,

        followersCount: number,
        followingCount: number,
        pendingSentFollowsCount: number | null,
        pendingReceivedFollowsCount: number | null,
    }

    isVisibleToUser: boolean,
    currentOutgoingFollow: {
        id: string,
        status: string,
    } | null,
    currentIncomingFollow: {
        id: string,
        status: string,
    } | null,
    totalReviewsCount: number | null,
    allFinishedCount: number | null,
    filmFinishedCount: number | null,
    seriesFinishedCount: number | null,
    bookFinishedCount: number | null,
    gameFinishedCount: number | null,
    editAccess: boolean,
}
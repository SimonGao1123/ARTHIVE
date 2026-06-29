type FollowMutationBase = {
    id: string
    status: string
    receiver: {
        id: string
        username: string
    }
    sender: {
        id: string
        username: string
    }
}

export type SendFollowInput = {
    input: {
        receiverId: string
    }
}

export type SendFollowResponse = {
    sendFollow: FollowMutationBase
}

export type ManipulateFollowInput = {
    input: {
        followId: string
        manipulation: string
    }
}

export type ManipulateFollowResponse = {
    manipulateFollow: FollowMutationBase
}

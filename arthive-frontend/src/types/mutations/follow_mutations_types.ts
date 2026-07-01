// SendFollow and ManipulateFollow both select the same follow shape.

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

// Backend FollowManipulationEnum: accept | reject | unfollow | cancel.
export type FollowManipulation = "accept" | "reject" | "unfollow" | "cancel"

export type ManipulateFollowInput = {
    input: {
        followId: string
        manipulation: FollowManipulation
    }
}

export type ManipulateFollowResponse = {
    manipulateFollow: FollowMutationBase
}

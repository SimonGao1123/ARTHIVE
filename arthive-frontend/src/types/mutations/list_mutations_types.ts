import type { ListType } from "@/types/queries/list_queries_types"
import type { User } from "@/types/domain/user"

export type LeaveListInput = {
    input: {
        listId: string
    }
}

export type LeaveListResponse = {
    leaveList: boolean
}
export type ListMemberType = {
    id: string
    list: ListType
    user: User
    role: string
    status: string
    sentByUser: User
    joinedAt: string | null
}

export type AlterListMembershipInput = {
    input: {
        listMemberId: string
        action: "remove" | "change_role"
        role: "member" | "admin" | null
        listId: string
    }
}

export type AlterListMembershipResponse = {
    alterListMembership: ListMemberType
}

export type CreateListInput = {
    name: string
    ifPrivate: boolean
    tags: string[] | null
    description: string | null
    addedMediaIds: string[] | null
}

export type CreateListResponse = {
    createList: {
        id: string
        name: string
        description: string | null
        contentType: string[]
        ifPrivate: boolean
        tags: string[] | null
    }
}

export type EditListDetailsInput = {
    listId: string
    name: string | null
    ifPrivate: boolean | null
    tags: string[] | null
    description: string | null
    deleteList: boolean
}

export type EditListDetailsResponse = {
    editListDetails: ListType
}

export type LikeListInput = {
    input: {
        listId: string
    }
}

export type LikeListResponse = {
    likeList: boolean
}

export type DeleteAllListMembersMutation = {
    deleteAllListMembers: boolean
}

export type DeleteAllListMembersMutationVariables = {
    input: {
        listId: string
    }
}

export type AcceptListInviteInput = {
    input: {
        listMemberId: string
        accept: boolean
    }
}

export type AcceptListInviteResponse = {
    acceptListInvite: ListMemberType
}

export type InviteUserToListInput = {
    input: {
        listId: string
        userId: string
        role: "member" | "admin"
    }
}

export type InviteUserToListResponse = {
    inviteUserToList: ListMemberType
}

export type RespondToListInviteInput = {
    input: {
        listMemberId: string
        accept: boolean
    }
}

export type RespondToListInviteResponse = {
    respondToListInvite: {
        id: string
        status: string
        role: string
    }
}

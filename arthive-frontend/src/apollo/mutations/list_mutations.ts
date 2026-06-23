import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    AlterListMembershipInput, AlterListMembershipResponse,
    CreateListInput, CreateListResponse,
    EditListDetailsInput, EditListDetailsResponse,
    LikeListInput, LikeListResponse,
    DeleteAllListMembersMutation, DeleteAllListMembersMutationVariables,
    AcceptListInviteInput, AcceptListInviteResponse,
    InviteUserToListInput, InviteUserToListResponse,
    RespondToListInviteInput, RespondToListInviteResponse,
} from "@/types/mutations/list_mutations_types"

export const ALTER_LIST_MEMBERSHIP_MUTATION: TypedDocumentNode<AlterListMembershipResponse, AlterListMembershipInput> = gql`
    mutation AlterListMembership($input: AlterListMembershipInput!) {
        alterListMembership(input: $input) {
            id
            list {
                id
            }
            user {
                id
            }
            role
            status
            sentByUser {
                id
            }
            joinedAt
        }
    }
`

export const CREATE_LIST_MUTATION: TypedDocumentNode<CreateListResponse, CreateListInput> = gql`
    mutation CreateList($input: CreateListInput!) {
        createList(input: $input) {
            id
            name
            description
            contentType
            ifPrivate
            tags
        }
    }
`


export const EDIT_LIST_DETAILS_MUTATION: TypedDocumentNode<EditListDetailsResponse, EditListDetailsInput> = gql`
    mutation EditListDetails($input: EditListDetailsInput!) {
        editListDetails(input: $input) {
            id
            name
            description
            contentType
            ifPrivate
            tags
            createdAt
            updatedAt
        }
    }
`

export const LIKE_LIST_MUTATION: TypedDocumentNode<LikeListResponse, LikeListInput> = gql`
    mutation LikeList($input: LikeListInput!) {
        likeList(input: $input)
    }
`

export const DELETE_ALL_LIST_MEMBERS_MUTATION: TypedDocumentNode<DeleteAllListMembersMutation, DeleteAllListMembersMutationVariables> = gql`
    mutation DeleteAllListMembers($input: DeleteAllListMembersInput!) {
        deleteAllListMembers(input: $input)
    }
`

export const ACCEPT_LIST_INVITE_MUTATION: TypedDocumentNode<AcceptListInviteResponse, AcceptListInviteInput> = gql`
    mutation AcceptListInvite($input: AcceptListInviteInput!) {
        acceptListInvite(input: $input) {
            id
            list {
                id
            }
            user {
                id
            }
            role
            status
            sentByUser {
                id
            }
            joinedAt
        }
    }
`
export const INVITE_USER_TO_LIST_MUTATION: TypedDocumentNode<InviteUserToListResponse, InviteUserToListInput> = gql`
    mutation InviteUserToList($input: InviteUserToListInput!) {
        inviteUserToList(input: $input) {
            id
            list {
                id
            }
            user {
                id
            }
            role
            status
            sentByUser {
                id
            }
            joinedAt
        }
    }
`
export const RESPOND_TO_LIST_INVITE_MUTATION: TypedDocumentNode<RespondToListInviteResponse, RespondToListInviteInput> = gql`
    mutation RespondToListInvite($input: RespondToListInviteInput!) {
        respondToListInvite(input: $input) {
            id
            status
            role
        }
    }
`
import { gql } from "@apollo/client"
import type { User } from "../user_types"

export const LIST_INVITATION_USER_SEARCH_QUERY = gql`
    query ListInvitationUserSearch($query: String!, $listId: ID!, $limit: Int) {
        listInvitationUserSearch(query: $query, listId: $listId, limit: $limit) {
            id
            username
            profilePicture
        }
    }
`

export type ListInvitationUserSearchInput = {
    query: string
    listId: string
    limit?: number
}

export type InvitableUser = Pick<User, "id" | "username" | "profilePicture">

export type ListInvitationUserSearchResponse = {
    listInvitationUserSearch: InvitableUser[]
}

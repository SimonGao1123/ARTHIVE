import { gql } from "@apollo/client";

export const DELETE_ALL_LIST_MEMBERS_MUTATION = gql`
    mutation DeleteAllListMembers($input: DeleteAllListMembersInput!) {
        deleteAllListMembers(input: $input)
    }
`

export type DeleteAllListMembersMutation = {
    deleteAllListMembers: boolean
}

export type DeleteAllListMembersMutationVariables = {
    input: {
        listId: string
    }
}
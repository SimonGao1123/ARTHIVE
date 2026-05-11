import {gql} from "@apollo/client"
import type { ListType } from "../queries/lists_request_queries"

export const CREATE_LIST_MUTATION = gql`
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

export type CreateListInput = {
    name: string,
    ifPrivate: boolean,
    tags: string[] | null,
    description: string | null,
    addedMediaIds: string[] | null
}
export type CreateListResponse = {
    createList: {
        id: string,
        name: string,
        description: string | null,
        contentType: string[],
        ifPrivate: boolean,
        tags: string[] | null
    }
}

export const ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION = gql`
    mutation AddOrRemoveMediaInList($input: AddOrRemoveMediaInListInput!) {
        addOrRemoveMediaInList(input: $input) {
            id
            name
            description
            contentType
            ifPrivate
            tags
        }
    }
`
export type AddOrRemoveMediaInListInput = {
    listId: string,
    ifAdd: boolean,
    mediaIds: string[]
}

export type AddOrRemoveMediaInListResponse = {
    addOrRemoveMediaInList: {
        id: string,
        name: string,
        description: string | null,
        contentType: string[],
        ifPrivate: boolean,
        tags: string[] | null
    }
}

export const EDIT_LIST_DETAILS_MUTATION = gql`
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
export type EditListDetailsInput = {
    listId: string,
    name: string | null,
    ifPrivate: boolean | null,
    tags: string[] | null,
    description: string | null
}
export type EditListDetailsResponse = {
    editListDetails: ListType
}


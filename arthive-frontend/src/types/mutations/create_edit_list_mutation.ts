import {gql} from "@apollo/client"

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


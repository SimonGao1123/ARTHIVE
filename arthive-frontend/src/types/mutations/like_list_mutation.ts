import { gql } from "@apollo/client"

export const LIKE_LIST_MUTATION = gql`
    mutation LikeList($input: LikeListInput!) {
        likeList(input: $input)
    }
`
export type LikeListInput = {
    input: {
        listId: string
    }
}
export type LikeListResponse = {
    likeList: boolean
}

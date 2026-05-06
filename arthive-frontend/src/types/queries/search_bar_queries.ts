import {gql} from "@apollo/client"

export const SEARCH_BAR_QUERY = gql`
    query SearchBar($query: String!, $searchType: SearchTypeEnum!, $searchFilter: [SearchFilterInput!], $pageNum: Int!, $limit: Int!) {
        searchBar(query: $query, searchType: $searchType, searchFilter: $searchFilter, pageNum: $pageNum, limit: $limit) {
            medias {
                id
                title
                coverImage
            }
            users {
                id
                username
                profilePicture
            }
            reviews {
                id
                content
                media {
                    id
                    title
                    coverImage
                }
                user {
                    id
                    username
                    profilePicture
                }
            }
        }
    }
`

export type SearchFilter = {
    filter: "content_type" | "genre",
    values: string[]
}
export type SearchBarInput = {
    query: string,
    searchType: string,
    searchFilter: SearchFilter[]
    pageNum: number,
    limit: number
}

export type MediaSearchType = {
    id: string,
    title: string,
    coverImage: string
}
export type UserSearchType = {
    id: string,
    username: string,
    profilePicture: string
}
export type ReviewSearchType = {
    id: string,
    content: string,
    media: MediaSearchType,
    user: UserSearchType
}
export type SearchBarResponse = {
    searchBar: {
        medias: MediaSearchType[] | null,
        users: UserSearchType[] | null,
        reviews: ReviewSearchType[] | null
    }
}
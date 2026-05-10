import {gql} from "@apollo/client"

export const SEARCH_BAR_QUERY = gql`
    query SearchBar($query: String!, $searchType: SearchTypeEnum!, $searchFilter: [SearchFilterInput!], $after: String, $first: Int) {
        searchBar(query: $query, searchType: $searchType, searchFilter: $searchFilter) {
            medias(after: $after, first: $first) {
                edges {
                    node {
                        id
                        title
                        coverImage
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }

            users(after: $after, first: $first) {
                edges {
                    node {
                        id
                        username
                        profilePicture
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            reviews(after: $after, first: $first) {
                edges {
                    node {
                        id
                        content
                        rating
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
                pageInfo {
                    endCursor
                    hasNextPage
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
    after: string | null,
    first: number | null
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
    rating: number,
    media: MediaSearchType,
    user: UserSearchType
}
export type SearchBarResponse = {
    searchBar: {
        medias: {
            edges: {
                node: MediaSearchType
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
        users: {
            edges: {
                node: UserSearchType
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
        reviews: {
            edges: {
                node: ReviewSearchType
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
    }
}
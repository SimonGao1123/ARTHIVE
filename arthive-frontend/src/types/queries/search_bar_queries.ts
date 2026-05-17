import {gql} from "@apollo/client"

export const SEARCH_BAR_QUERY = gql`
    query SearchBar(
    $query: String!, 
    $searchType: SearchTypeEnum!, 
    $searchFilter: [SearchFilterInput!], 
    $after_medias: String, 
    $first_medias: Int, 
    $after_users: String, 
    $first_users: Int, 
    $after_reviews: String, 
    $first_reviews: Int, 
    $after_lists: String, 
    $first_lists: Int, 
    $after_threads: String, 
    $first_threads: Int
    ) {
        searchBar(query: $query, searchType: $searchType, searchFilter: $searchFilter) {
            medias(after: $after_medias, first: $first_medias) {
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

            users(after: $after_users, first: $first_users) {
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
            reviews(after: $after_reviews, first: $first_reviews) {
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

            lists(after: $after_lists, first: $first_lists) {
                edges {
                    node {
                        id
                        name
                        description
                        contentType
                        ifPrivate
                        tags
                        user {
                            id
                            username
                            profilePicture
                        }
                        mediaInLists(pageNum: 1, limit: 3) {
                            media {
                                coverImage
                            }
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            threads(after: $after_threads, first: $first_threads) {
                edges {
                    node {
                        id
                        title
                        content
                        user {
                            id
                            username
                            profilePicture
                        }
                        community {
                            id
                            media {
                                id
                                title
                                coverImage
                            }
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

export type ListSearchType = {
    id: string,
    name: string,
    description: string | null,
    contentType: string[],
    ifPrivate: boolean,
    tags: string[],
    user: UserSearchType,
    mediaInLists: {
        media: MediaSearchType
    }[]
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}

export type ThreadSearchType = {
    id: string,
    title: string | null,
    content: string,
    user: UserSearchType,
    community: CommunitySearchType
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}
export type CommunitySearchType = {
    id: string,
    media: MediaSearchType
}
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
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}
export type UserSearchType = {
    id: string,
    username: string,
    profilePicture: string
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
}
export type ReviewSearchType = {
    id: string,
    content: string,
    rating: number,
    media: MediaSearchType,
    user: UserSearchType
    pageInfo: {
        endCursor: string
        hasNextPage: boolean
    }
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
        lists: {
            edges: {
                node: ListSearchType
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
        threads: {
            edges: {
                node: ThreadSearchType
            }[]
            pageInfo: {
                endCursor: string
                hasNextPage: boolean
            }
        }
    }
}
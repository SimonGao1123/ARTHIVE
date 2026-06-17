import { gql } from "@apollo/client"
import type { Review } from "../review_type"
import type { ListType } from "../queries/lists_request_queries"
import type { CommunityThread } from "../queries/community_request_queries"
import type { Media } from "../media_type"
export const OBTAIN_ARCHIVR_CONVERSATION = gql`
    query ObtainArchivrConversation($mediaId: ID!, $after: String, $first: Int) {
        obtainArchivrConversation(mediaId: $mediaId, after: $after, first: $first) {
            edges {
                node {
                    id
                    content
                    role
                    createdAt

                    reviewRefs {
                        id
                        content
                        rating
                        ifFavorite
                        ifFinished
                        updatedAt
                        user {
                            id
                            username
                            profilePicture
                        }
                        media {
                            id
                            title
                            coverImage
                        }
                        imageDetails {
                            signedId
                            url
                        }
                    }

                    listRefs {
                        id
                        name
                        description
                        tags
                        user {
                            id
                            username
                            profilePicture
                        }
                        mediaInLists (pageNum: 1, limit: 3) {
                            media {
                                id
                                title
                                coverImage
                            }
                        }
                    }

                    threadRefs {
                        id
                        title
                        content
                        imageDetails {
                            signedId
                            url
                        }
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

                    mediaRefs {
                        id
                        title
                        coverImage
                        year
                        creator
                        genre
                        contentType
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`

export type ArchivrMessage = {
    id: string
    content: string
    role: "user" | "assistant"
    createdAt: string
    reviewRefs: Review[]
    listRefs: ListType[]
    threadRefs: CommunityThread[]
    mediaRefs: Media[]
}

export type ObtainArchivrConversationResponse = {
    obtainArchivrConversation: {
        edges: {
            node: ArchivrMessage
        } []
        pageInfo: {
            hasNextPage: boolean
            endCursor: string
        }
    }
}

export type ObtainArchivrConversationInput = {
    mediaId: string
    after: string | null
    first: number
}
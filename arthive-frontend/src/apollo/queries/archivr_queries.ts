import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    ObtainArchivrConversationInput,
    ObtainArchivrConversationResponse,
} from "@/types/queries/archivr_queries_types"

export const OBTAIN_ARCHIVR_CONVERSATION: TypedDocumentNode<ObtainArchivrConversationResponse, ObtainArchivrConversationInput> = gql`
    query ObtainArchivrConversation($mediaId: ID!, $after: String, $first: Int) {
        obtainArchivrConversation(mediaId: $mediaId) {
            recommendedPrompts
            messages(first: $first, after: $after) {
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
    }
`


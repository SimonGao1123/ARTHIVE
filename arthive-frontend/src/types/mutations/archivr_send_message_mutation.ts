import { gql } from "@apollo/client"
import type { ArchivrMessage } from "../queries/archivr_chat_request_query"

export const MESSAGE_ARCHIVR = gql`
    mutation MessageArchivr($input: MessageArchivrInput!) {
        messageArchivr(input: $input) {
            id
            content
            role

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
`

export type MessageArchivrInput = {
    input: {
        mediaId: string
        query: string
    }
}

export type MessageArchivrResponse = {
    messageArchivr: ArchivrMessage
}


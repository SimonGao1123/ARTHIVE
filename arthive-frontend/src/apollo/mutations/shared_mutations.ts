import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    RemoveAttachedImageInput, RemoveAttachedImageResponse,
    ReadNotificationsInput, ReadNotificationsResponse,
    UploadImageToS3Input, UploadImageToS3Response,
} from "@/types/mutations/shared_mutations_types"

export const REMOVE_ATTACHED_IMAGE_MUTATION: TypedDocumentNode<RemoveAttachedImageResponse, RemoveAttachedImageInput> = gql`
    mutation RemoveAttachedImage($input: RemoveAttachedImageInput!) {
        removeAttachedImage(input: $input)
    }
`

export const READ_NOTIFICATIONS_MUTATION: TypedDocumentNode<ReadNotificationsResponse, ReadNotificationsInput> = gql`
    mutation ReadNotifications($input: ReadNotificationsInput!) {
        readNotifications(input: $input)
    }
`

export const UPLOAD_IMAGE_TO_S3_MUTATION: TypedDocumentNode<UploadImageToS3Response, UploadImageToS3Input> = gql`
  mutation attachS3Image($signedIds: [String!]!, $resourceId: ID!, $resourceType: PossibleResourceImageTypesEnum!) {
    attachS3Image(input: {
      signedIds: $signedIds, resourceId: $resourceId, resourceType: $resourceType
    }) {
      success
    }
  }
`;
import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    AddOrRemoveMediaInListInput, AddOrRemoveMediaInListResponse,
    UploadMediaInput, UploadMediaResponse,
} from "@/types/mutations/media_mutations_types"

export const UPLOAD_MEDIA_MUTATION: TypedDocumentNode<UploadMediaResponse, UploadMediaInput> = gql`
  mutation CreateMedia(
    $title: String!, $creator: String!, $year: String!,
    $contentType: ContentTypeEnum!, $language: String!, $summary: String!,
    $genre: [String!]!, $ongoing: Boolean!, 
    $actors: [String!], $pageCount: Int,
    $seriesTitle: String, $organization: String
  ) {
    createMedia(input: {
      title: $title, creator: $creator, year: $year,
      contentType: $contentType, language: $language, summary: $summary,
      genre: $genre, ongoing: $ongoing,
      actors: $actors, pageCount: $pageCount,
      seriesTitle: $seriesTitle, organization: $organization
    }) {
      id
      title
    }
  }
`;

export const ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION: TypedDocumentNode<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput> = gql`
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
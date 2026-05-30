import { gql } from "@apollo/client";

export const UPLOAD_MEDIA_MUTATION = gql`
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

export const UPLOAD_IMAGE_TO_S3_MUTATION = gql`
  mutation attachS3Image($signedIds: [String!]!, $resourceId: ID!, $resourceType: PossibleResourceImageTypesEnum!) {
    attachS3Image(input: {
      signedIds: $signedIds, resourceId: $resourceId, resourceType: $resourceType
    }) {
      success
    }
  }
`;
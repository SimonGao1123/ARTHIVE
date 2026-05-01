import { gql } from "@apollo/client";

export const UPLOAD_MEDIA_MUTATION = gql`
  mutation CreateMedia(
    $title: String!, $creator: String!, $year: String!,
    $contentType: ContentTypeEnum!, $language: String!, $summary: String!,
    $genre: [String!]!, $ongoing: Boolean!, $coverImage: String!,
    $actors: [String!], $pageCount: Int,
    $seriesTitle: String, $organization: String
  ) {
    createMedia(input: {
      title: $title, creator: $creator, year: $year,
      contentType: $contentType, language: $language, summary: $summary,
      genre: $genre, ongoing: $ongoing, coverImage: $coverImage,
      actors: $actors, pageCount: $pageCount,
      seriesTitle: $seriesTitle, organization: $organization
    }) {
      id
      title
      coverImage
    }
  }
`;
// for retreiving media from the backend
export type Media = {
    id: string;
    title: string;
    creator: string;
    year: string;
    contentType: "book" | "film" | "series" | "game";
    language: string;
    summary: string;
    genre: string[];
    ongoing: boolean;
    actors: string[] | null;
    pageCount: number | null;
    seriesTitle: string | null;
    organization: string | null;
    coverImage: string | null; // url of the cover image
    inLists: {
        id: string;
        name: string;
    }[];
    reviewsAiSummary: string | null;
    reviewCount: number;
    ifFavorite: boolean;
    ifFinished: boolean;
}
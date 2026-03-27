// for retreiving media from the backend
export type Media = {
    id: number;
    title: string;
    creator: string;
    year: string;
    content_type: "book" | "film" | "series";
    language: string;
    summary: string;
    genre: string[];
    ongoing: boolean;
    actors: string[];
    page_count: number | null;
    series_title: string | null;
    organization: string | null;
    cover_image: string | null; // url of the cover image
}
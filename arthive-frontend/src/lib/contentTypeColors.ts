export type ContentType = "book" | "film" | "series" | "game"

export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
    film: "#EF8019",
    series: "#FB44EF",
    book: "#3FE2FB",
    game: "#1DD07D",
}

export function contentTypeColor(type: string | undefined | null): string {
    if (!type) return "#3a3a4a"
    return CONTENT_TYPE_COLORS[type as ContentType] ?? "#3a3a4a"
}

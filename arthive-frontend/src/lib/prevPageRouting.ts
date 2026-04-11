const SEG = "--"

/** Single path segment for `/:prev_page/review_info/:id` (no slashes in result). */
export function encodeReturnPath(pathname: string): string {
    return pathname.split("/").filter(Boolean).join(SEG)
}

/** Target path for Back from review or media info when `prev_page` is that segment. */
export function decodeReturnPath(prevSegment: string | undefined): string {
    if (!prevSegment) return "/"
    if (prevSegment === "explore") return "/"
    if (prevSegment === "all_reviews" || prevSegment === "all-reviews") return "/all_reviews"
    if (prevSegment.includes(SEG)) {
        return "/" + prevSegment.split(SEG).join("/")
    }
    // legacy: slash segments joined with single "-"
    return "/" + prevSegment.split("-").join("/")
}

/** `/media/:prev/:mediaId` from review page's `prev_page` token and media id. */
export function mediaInfoPathFromReviewPrev(
    prevSegment: string | undefined,
    mediaId: number
): string {
    if (!prevSegment) return `/media/explore/${mediaId}`
    if (prevSegment === "explore") return `/media/explore/${mediaId}`
    if (prevSegment === "all_reviews" || prevSegment === "all-reviews") {
        return `/media/all_reviews/${mediaId}`
    }

    const decoded = prevSegment.includes(SEG)
        ? prevSegment.split(SEG).join("/")
        : prevSegment.split("-").join("/")
    const base = decoded.endsWith("/reviews")
        ? decoded.slice(0, -"/reviews".length)
        : decoded
    if (base.startsWith("media/")) {
        return "/" + base
    }
    return `/media/explore/${mediaId}`
}

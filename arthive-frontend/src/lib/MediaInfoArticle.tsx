import type { Media } from "../types/media_type"

export function MediaInfoArticle({ media }: { media: Media}) {
    return (
        <article aria-labelledby={`media-title-${media.id}`}>

            <header>
                <h1 id={`media-title-${media.id}`}>{media.title}</h1>
                <p>
                    By <span>{media.creator}</span>
                </p>
            </header>

            {media.coverImage ? (
                <figure>
                    <img
                        width={230}
                        height={300}
                        src={media.coverImage}
                        alt={`Cover image for ${media.title}`}
                    />
                </figure>
            ) : null}

            <section aria-labelledby={`summary-heading-${media.id}`}>
                <h2 id={`summary-heading-${media.id}`}>Summary</h2>
                <p>{media.summary}</p>
            </section>

            <section aria-labelledby={`details-heading-${media.id}`}>
                <h2 id={`details-heading-${media.id}`}>Details</h2>
                <dl>
                    <dt>Genre</dt>
                    <dd>{media.genre.join(", ")}</dd>

                    <dt>Year</dt>
                    <dd>{media.year}</dd>

                    <dt>Language</dt>
                    <dd>{media.language}</dd>

                    <dt>Type</dt>
                    <dd>{media.contentType}</dd>

                    <dt>Status</dt>
                    <dd>{media.ongoing ? "Ongoing" : "Completed"}</dd>

                    {media.actors && media.actors.length > 0 ? (
                        <>
                            <dt>Actors</dt>
                            <dd>{media.actors.join(", ")}</dd>
                        </>
                    ) : null}

                    {media.pageCount != null ? (
                        <>
                            <dt>Page count</dt>
                            <dd>{media.pageCount}</dd>
                        </>
                    ) : null}

                    {media.seriesTitle ? (
                        <>
                            <dt>Series title</dt>
                            <dd>{media.seriesTitle}</dd>
                        </>
                    ) : null}

                    {media.organization ? (
                        <>
                            <dt>Organization</dt>
                            <dd>{media.organization}</dd>
                        </>
                    ) : null}
                </dl>
            </section>
        </article>
    )
}

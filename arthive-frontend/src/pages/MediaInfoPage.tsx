import { useLazyQuery } from "@apollo/client/react"
import {
    OBTAIN_MEDIA_INFO_QUERY,
    type ObtainMediaInfoInput,
    type ObtainMediaInfoResponse,
} from "../types/queries/media_request_query"
import type { User } from "../types/user_types"
import { useNavigate, useParams } from "react-router-dom"
import type { Media } from "../types/media_type"
import { useEffect, useState } from "react"
import { ObtainMediaDetailsFetch } from "../data/obtain_media_details"

type MediaInfoPageProps = {
    setUser: (user: User | null) => void
}

export default function MediaInfoPage({ setUser }: MediaInfoPageProps) {
    const { prev_page, id } = useParams()
    const navigate = useNavigate()
    const [getMediaInfo, { error, loading }] = useLazyQuery<
        ObtainMediaInfoResponse,
        ObtainMediaInfoInput
    >(OBTAIN_MEDIA_INFO_QUERY)
    const [mediaInfo, setMediaInfo] = useState<Media | null>(null)

    useEffect(() => {
        const mediaId = id != null && id !== "" ? Number(id) : NaN
        if (!Number.isFinite(mediaId)) {
            navigate("/", { replace: true })
            return
        }
        try {
            ObtainMediaDetailsFetch(
                getMediaInfo,
                navigate,
                setUser,
                mediaId,
                setMediaInfo
            )
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            console.log(message)
            navigate("/", { replace: true })
        }
    }, [id])

    const showContent = Boolean(mediaInfo) && !loading

    return (
        <main>
            {loading ? (
                <p role="status" aria-live="polite">
                    Loading…
                </p>
            ) : null}

            {error ? (
                <div role="alert">
                    <p>{error.message}</p>
                </div>
            ) : null}

            {showContent && mediaInfo ? (
                <MediaInfoArticle media={mediaInfo} prev_page={prev_page ?? "explore"} />
            ) : null}
        </main>
    )
}

function MediaInfoArticle({ media, prev_page }: { media: Media, prev_page: string }) {
    const navigate = useNavigate()
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
            <button onClick={() => navigate(prev_page == "explore" ? "/" : `/${prev_page}`)}>Back</button>
        </article>
    )
}

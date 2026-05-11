import { useMutation } from "@apollo/client/react"
import type { Media } from "../types/media_type"
import type { AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput } from "../types/mutations/create_edit_list_mutation"
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION } from "../types/mutations/create_edit_list_mutation"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addOrRemoveMediaData } from "../data/add_or_remove_media_data"
import type { User } from "../types/user_types"

export function MediaInfoArticle({ media, setUser, setMediaInfo }: { media: Media, setUser: (user: User | null) => void, setMediaInfo: (mediaInfo: Media | null) => void}) {
    const [addOrRemoveMediaInListMutation, {loading, error}] = useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)
    const [removeListId, setRemoveListId] = useState<string>("")
    const navigate = useNavigate()
    
    useEffect(() => {
        if (removeListId !== "") {
            addOrRemoveMediaData(addOrRemoveMediaInListMutation, removeListId, [media.id.toString()], setUser, navigate, false)
        }
    }, [removeListId])
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

            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}

            {media.inLists.length > 0 ? (
                <section aria-labelledby={`in-lists-heading-${media.id}`}>
                    <h2 id={`in-lists-heading-${media.id}`}>In Lists</h2>
                    <ul>
                        {media.inLists.map((list) => (
                            <>
                                <li key={list.id}>{list.name}</li>
                                <button onClick={() => {
                                    setRemoveListId(list.id)
                                    setMediaInfo({...media, inLists: media.inLists.filter((l) => l.id !== list.id)})

                                }}>Remove from List</button>
                            </>
                        ))}
                    </ul>
                </section>
            ) : null}
        </article>
    )
}

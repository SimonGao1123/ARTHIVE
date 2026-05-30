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
        <article
            aria-labelledby={`media-title-${media.id}`}
            className="bg-[#171519] rounded-2xl border border-white/5 p-8 w-full h-full flex flex-col"
        >
            <header className="mb-6">
                <h1
                    id={`media-title-${media.id}`}
                    className="text-4xl font-bold text-white leading-tight"
                >
                    {media.title}
                </h1>
                <p className="text-base text-gray-400 mt-3">
                    <span className="text-gray-300">{media.year}</span>
                    <span className="mx-2 text-gray-600">·</span>
                    By <span className="text-gray-300">{media.creator}</span>
                </p>
            </header>

            <section aria-labelledby={`summary-heading-${media.id}`} className="mb-6">
                <h2 id={`summary-heading-${media.id}`} className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Summary
                </h2>
                <p className="text-gray-200 leading-relaxed text-base">{media.summary}</p>
            </section>

            <section aria-labelledby={`details-heading-${media.id}`} className="mb-6">
                <h2 id={`details-heading-${media.id}`} className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Details
                </h2>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Genre</dt>
                        <dd className="text-white">{media.genre.join(", ")}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Language</dt>
                        <dd className="text-white">{media.language}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Type</dt>
                        <dd className="text-white capitalize">{media.contentType}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</dt>
                        <dd className="text-white">{media.ongoing ? "Ongoing" : "Completed"}</dd>
                    </div>
                    {media.actors && media.actors.length > 0 ? (
                        <div className="col-span-2">
                            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Actors</dt>
                            <dd className="text-white">{media.actors.join(", ")}</dd>
                        </div>
                    ) : null}
                    {media.pageCount != null ? (
                        <div>
                            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Page count</dt>
                            <dd className="text-white">{media.pageCount}</dd>
                        </div>
                    ) : null}
                    {media.seriesTitle ? (
                        <div>
                            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Series</dt>
                            <dd className="text-white">{media.seriesTitle}</dd>
                        </div>
                    ) : null}
                    {media.organization ? (
                        <div>
                            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">Organization</dt>
                            <dd className="text-white">{media.organization}</dd>
                        </div>
                    ) : null}
                </dl>
            </section>

            {error && <div className="text-red-400 text-sm mb-2">{error.message}</div>}
            {loading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}

            {media.inLists.length > 0 ? (
                <section aria-labelledby={`in-lists-heading-${media.id}`} className="mb-6">
                    <h2 id={`in-lists-heading-${media.id}`} className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        In Lists
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                        {media.inLists.map((list) => (
                            <li
                                key={list.id}
                                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-white"
                            >
                                <span>{list.name}</span>
                                <button
                                    onClick={() => {
                                        setRemoveListId(list.id)
                                        setMediaInfo({...media, inLists: media.inLists.filter((l) => l.id !== list.id)})
                                    }}
                                    className="text-gray-400 hover:text-white transition"
                                    aria-label={`Remove from ${list.name}`}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <div className="mt-auto pt-2">
                <button
                    onClick={() => navigate(`/community/${media.id}`)}
                    className="border border-violet-500 text-violet-400 px-5 py-2 rounded-full text-sm hover:bg-violet-500/10 transition"
                >
                    Community
                </button>
            </div>
        </article>
    )
}

import { logout } from "@/data/auth/logout"
import type { User } from "@/types/domain/user"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, type NavigateFunction } from "react-router-dom"
import type { Media } from "@/types/domain/media"
import { OBTAIN_MEDIA_INFO_QUERY } from "@/apollo/queries/media_queries"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { ObtainMediaDetailsFetch } from "@/data/media/obtainMediaDetails"
import { EDIT_MEDIA_MUTATION } from "@/apollo/mutations/media_mutations"
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "@/apollo/mutations/shared_mutations"
import { editMediaDetails } from "@/data/media/editMediaDetails"
import { InputField, ContentTypeRadio, GenreInput, ActorsInput } from "./UploadMedia"

type Props = {
    user: User
    setUser: (user: User | null) => void
}
export default function EditMedia({user, setUser}: Props) {
    const navigate = useNavigate()

    // check if the user is logged in and is an admin
    useEffect(() => {
        if (!user) {
            logout(setUser, navigate)
            return
        }

        if (!user.ifAdmin) {
            navigate("/")
            return
        }
    }, [user])

    const [media, setMedia] = useState<Media | null>(null)

    const [editMedia, {loading, error}] = useMutation(EDIT_MEDIA_MUTATION)
    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION)

    const [title, setTitle] = useState("")
    const [creator, setCreator] = useState("")
    const [year, setYear] = useState("")
    const [content_type, setContentType] = useState("")
    const [language, setLanguage] = useState("")
    const [summary, setSummary] = useState("")
    const [genre, setGenre] = useState<string[]>([])
    const [ongoing, setOngoing] = useState(false)
    const [actors, setActors] = useState<string[]>([])
    const [page_count, setPageCount] = useState<number | null>(null)
    const [series_title, setSeriesTitle] = useState<string | null>(null)
    const [organization, setOrganization] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [cover_image, setCoverImage] = useState<File | null>(null)

    useEffect(() => {
        if (media) {
            setTitle(media.title)
            setCreator(media.creator)
            setYear(media.year)
            setContentType(media.contentType)
            setLanguage(media.language)
            setSummary(media.summary)
            setGenre(media.genre)
            setOngoing(media.ongoing)
            setActors(media.actors || [])
            setPageCount(media.pageCount || null)
            setSeriesTitle(media.seriesTitle || null)
            setOrganization(media.organization || null)
            setCoverImage(null)
        }
    }, [media])

    return (
        <div>
            {!media && <MediaInputField setMedia={setMedia} navigate={navigate} setUser={setUser} />}
            {media && (
                <EditMediaForm
                    media={media}
                    setMedia={setMedia}
                    title={title} setTitle={setTitle}
                    creator={creator} setCreator={setCreator}
                    year={year} setYear={setYear}
                    content_type={content_type} setContentType={setContentType}
                    language={language} setLanguage={setLanguage}
                    summary={summary} setSummary={setSummary}
                    genre={genre} setGenre={setGenre}
                    ongoing={ongoing} setOngoing={setOngoing}
                    actors={actors} setActors={setActors}
                    page_count={page_count} setPageCount={setPageCount}
                    series_title={series_title} setSeriesTitle={setSeriesTitle}
                    organization={organization} setOrganization={setOrganization}
                    cover_image={cover_image} setCoverImage={setCoverImage}
                    fileInputRef={fileInputRef}
                    editMedia={editMedia} uploadImageToS3={uploadImageToS3}
                    loading={loading} error={error}
                    setUser={setUser} navigate={navigate}
                />
            )}
        </div>
    )
}


type MediaInputFieldProps = {
    setMedia: (media: Media | null) => void
    navigate: NavigateFunction
    setUser: (user: User | null) => void
}
function MediaInputField({setMedia, navigate, setUser}: MediaInputFieldProps) {
    const [mediaLink, setMediaLink] = useState("")

    const [obtainMediaDetails, {loading, error}] = useLazyQuery(OBTAIN_MEDIA_INFO_QUERY)

    const handleObtainMediaDetails = () => {
        const mediaId = parseInt(mediaLink.split("/").pop() || "0")

        if (isNaN(mediaId)) {
            alert("Invalid media link")
            return
        }

        ObtainMediaDetailsFetch(obtainMediaDetails, navigate, setUser, mediaId, setMedia)
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Link to="/admin" className="text-gray-400 hover:text-white transition text-sm">Admin</Link>
                <span className="text-gray-600 text-sm">/</span>
                <h1 className="text-xl font-semibold text-white">Edit Media</h1>
            </div>

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Find media</p>
                <div>
                    <label htmlFor="media_link" className="block text-xs text-gray-400 mb-1.5">Media link</label>
                    <input
                        id="media_link"
                        type="text"
                        placeholder="Paste a media link (e.g. /media/123)"
                        value={mediaLink}
                        onChange={(e) => setMediaLink(e.target.value)}
                        className="w-full bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleObtainMediaDetails}
                    disabled={loading}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full transition"
                >
                    {loading ? "Loading…" : "Load Media"}
                </button>
                {error && (
                    <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error.message}
                    </p>
                )}
            </div>
        </div>
    )
}


type EditMediaFormProps = {
    media: Media
    setMedia: (media: Media | null) => void
    title: string; setTitle: (v: string) => void
    creator: string; setCreator: (v: string) => void
    year: string; setYear: (v: string) => void
    content_type: string; setContentType: (v: string) => void
    language: string; setLanguage: (v: string) => void
    summary: string; setSummary: (v: string) => void
    genre: string[]; setGenre: (v: string[]) => void
    ongoing: boolean; setOngoing: (v: boolean) => void
    actors: string[]; setActors: (v: string[]) => void
    page_count: number | null; setPageCount: (v: number | null) => void
    series_title: string | null; setSeriesTitle: (v: string | null) => void
    organization: string | null; setOrganization: (v: string | null) => void
    cover_image: File | null; setCoverImage: (v: File | null) => void
    fileInputRef: React.RefObject<HTMLInputElement | null>
    editMedia: any
    uploadImageToS3: any
    loading: boolean
    error: any
    setUser: (user: User | null) => void
    navigate: NavigateFunction
}
function EditMediaForm(props: EditMediaFormProps) {
    const {
        media, setMedia,
        title, setTitle, creator, setCreator, year, setYear,
        content_type, setContentType, language, setLanguage,
        summary, setSummary, genre, setGenre, ongoing, setOngoing,
        actors, setActors, page_count, setPageCount,
        series_title, setSeriesTitle, organization, setOrganization,
        cover_image, setCoverImage, fileInputRef,
        editMedia, uploadImageToS3, loading, error,
        setUser, navigate,
    } = props

    const displayedCoverUrl = cover_image
        ? URL.createObjectURL(cover_image)
        : media.coverImage

    const buildPayload = (if_deleted: boolean) => ({
        media_id: media.id,
        title, creator, year, content_type, language, summary,
        genre, ongoing, actors, page_count, series_title, organization,
        cover_image: if_deleted ? null : cover_image,
        if_deleted,
    })

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link to="/admin" className="text-gray-400 hover:text-white transition text-sm">Admin</Link>
                    <span className="text-gray-600 text-sm">/</span>
                    <h1 className="text-xl font-semibold text-white">Edit Media</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setMedia(null)}
                    className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-3 py-1.5 transition"
                >
                    ← Pick a different media
                </button>
            </div>

            {error && (
                <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                    {error.message}
                </p>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    editMediaDetails(buildPayload(false), setUser, navigate, editMedia, uploadImageToS3)
                }}
                className="space-y-4"
            >
                <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Basic Info</p>
                    <InputField title="Title" type="text" value={title} setter={setTitle} can_be_empty={false}/>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField title="Creator" type="text" value={creator} setter={setCreator} can_be_empty={false}/>
                        <InputField title="Year" type="text" value={year} setter={setYear} can_be_empty={false}/>
                    </div>
                    <InputField title="Language" type="text" value={language} setter={setLanguage} can_be_empty={false}/>
                    <InputField title="Summary" type="textarea" value={summary} setter={setSummary} can_be_empty={false}/>
                </div>

                <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Type & Genres</p>
                    <ContentTypeRadio content_type={content_type} setContentType={setContentType}/>
                    <GenreInput genre={genre} setGenre={setGenre}/>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                            type="checkbox"
                            id="ongoing"
                            checked={ongoing}
                            onChange={(e) => setOngoing(e.target.checked)}
                            className="accent-violet-500 w-4 h-4"
                        />
                        <span className="text-sm text-gray-300">Ongoing</span>
                    </label>
                </div>

                <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cast & Details</p>
                    {content_type != "book"
                        ? <ActorsInput actors={actors} setActors={setActors}/>
                        : <InputField title="Page Count" type="number" value={page_count} setter={setPageCount} can_be_empty={true}/>
                    }
                    <div className="grid grid-cols-2 gap-4">
                        <InputField title="Series Title" type="text" value={series_title} setter={setSeriesTitle} can_be_empty={true}/>
                        <InputField title="Organization" type="text" value={organization} setter={setOrganization} can_be_empty={true}/>
                    </div>
                </div>

                <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cover Image</p>
                    {displayedCoverUrl ? (
                        <div className="relative w-fit">
                            <label htmlFor="cover_image" className="block cursor-pointer group">
                                <img
                                    width={180}
                                    src={displayedCoverUrl}
                                    alt="Cover preview"
                                    className="rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-white text-xs font-medium">Click to replace</span>
                                </div>
                            </label>
                            {cover_image && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                        setCoverImage(null)
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center text-xs transition z-10"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ) : (
                        <label
                            htmlFor="cover_image"
                            className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition"
                        >
                            <span className="text-gray-400 text-sm">Click to select image</span>
                            <span className="text-gray-600 text-xs mt-1">PNG, JPG, WebP</span>
                        </label>
                    )}
                    <input
                        type="file"
                        id="cover_image"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        className="sr-only"
                    />
                    {cover_image && media.coverImage && (
                        <p className="text-xs text-gray-500">Showing newly selected file. Remove to restore the original cover.</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full transition"
                >
                    {loading ? "Saving…" : "Save Changes"}
                </button>

                <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                        if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return
                        await editMediaDetails(buildPayload(true), setUser, navigate, editMedia, uploadImageToS3)
                        navigate("/admin")
                    }}
                    className="w-full mt-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-red-300 border border-red-500/40 font-semibold py-2.5 rounded-full transition"
                >
                    Delete Media
                </button>
            </form>
        </div>
    )
}

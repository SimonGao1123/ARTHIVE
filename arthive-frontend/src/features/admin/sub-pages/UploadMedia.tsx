import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { User } from "@/types/domain/user"
import { mediaUpload } from "@/data/media/mediaUpload"
import { useMutation } from "@apollo/client/react"
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "@/apollo/mutations/shared_mutations"
import { UPLOAD_MEDIA_MUTATION } from "@/apollo/mutations/media_mutations"
import { ALL_GENRES } from "@/shared/utils/globalConstants"

export default function UploadMedia({user, setUser}: {user: User, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()

    const [createMedia, {loading, error}] = useMutation(UPLOAD_MEDIA_MUTATION);

    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION);

    // not signed in or not admin → send home. App.tsx's whoami flow owns the auth state.
    useEffect(() => {
        if (!user || !user.ifAdmin) {
            navigate("/")
        }
    }, [user])

    const [title, setTitle] = useState("")
    const [creator, setCreator] = useState("")
    const [year, setYear] = useState("")
    const [content_type, setContentType] = useState("book")
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
    const [cover_image_url, setCoverImageUrl] = useState<string | null>(null)



    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Link to="/admin" className="text-gray-400 hover:text-white transition text-sm">Admin</Link>
                <span className="text-gray-600 text-sm">/</span>
                <h1 className="text-xl font-semibold text-white">Upload Media</h1>
            </div>

            {error && (
                <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                    {error.message}
                </p>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    mediaUpload({title, creator, year, content_type, language, summary, genre, ongoing, actors, page_count, series_title, organization, cover_image}, setUser, navigate, createMedia, uploadImageToS3)
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
                    {cover_image ? (
                        <div className="relative w-fit">
                            <img
                                width={180}
                                src={cover_image_url || URL.createObjectURL(cover_image)}
                                alt="Cover preview"
                                className="rounded-lg object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = ""
                                        setCoverImage(null)
                                        setCoverImageUrl(null)
                                    }
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center text-xs transition"
                            >
                                ×
                            </button>
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
                        onChange={(e) => {
                            setCoverImage(e.target.files?.[0] || null)
                            if (e.target.files?.[0]) {
                                setCoverImageUrl(URL.createObjectURL(e.target.files?.[0]))
                            } else {
                                setCoverImageUrl(null)
                            }
                        }}
                        className="sr-only"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full transition"
                >
                    {loading ? "Uploading…" : "Upload Media"}
                </button>
            </form>
        </div>
    )
}

export function InputField({title, type, value, setter, can_be_empty}: {title: string, type: string, value: any, setter: any, can_be_empty: boolean}) {
    const id = title.toLowerCase().replaceAll(" ", "_")
    const handleChange = (val: string) => {
        if (can_be_empty && val === "") {
            setter(null)
            return
        }
        if (type === "number") {
            // HTML inputs always return strings; the GraphQL Int scalar
            // rejects "300". Parse first; ignore non-numeric typing.
            const n = parseInt(val, 10)
            setter(Number.isNaN(n) ? null : n)
            return
        }
        setter(val)
    }
    return (
        <div>
            <label htmlFor={id} className="block text-xs text-gray-400 mb-1.5">{title}</label>
            {type === "textarea" ? (
                <textarea
                    id={id}
                    value={value || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition resize-y"
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    value={value || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                />
            )}
        </div>
    )
}

const CONTENT_TYPE_OPTIONS = [
    { value: "book",   label: "Book",   color: "#3FE2FB" },
    { value: "film",   label: "Film",   color: "#EF8019" },
    { value: "series", label: "Series", color: "#FB44EF" },
    { value: "game",   label: "Game",   color: "#1DD07D" },
]

export function ContentTypeRadio({content_type, setContentType}: {content_type: string, setContentType: (content_type: string) => void}) {
    return (
        <div>
            <label className="block text-xs text-gray-400 mb-2">Content Type</label>
            <div className="flex gap-2 flex-wrap">
                {CONTENT_TYPE_OPTIONS.map(({ value, label, color }) => {
                    const active = content_type === value
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setContentType(value)}
                            style={active ? { backgroundColor: `${color}20`, borderColor: `${color}66`, color } : {}}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                                active ? "" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            }`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export function GenreInput({genre, setGenre}: {genre: string[], setGenre: (genre: string[]) => void}) {
    const [currGenre, setCurrGenre] = useState<string>("")
    const lcInput = currGenre.toLowerCase().trim()
    // Original casing lookup so base genres render "Drama" not "drama".
    const baseDisplay = new Map(ALL_GENRES.map(g => [g.toLowerCase(), g]))
    const baseSuggestions = ALL_GENRES
        .map(g => g.toLowerCase())
        .filter(gl => !genre.includes(gl) && (lcInput === "" || gl.startsWith(lcInput)))

    const addCustomGenre = () => {
        if (!lcInput) return
        if (!genre.includes(lcInput)) setGenre([...genre, lcInput])
        setCurrGenre("")
    }

    return (
        <div>
            <label htmlFor="genre" className="block text-xs text-gray-400 mb-1.5">Genres</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={currGenre}
                    onChange={(e) => setCurrGenre(e.target.value)}
                    id="genre"
                    placeholder="Search or add custom…"
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                />
                <button
                    type="button"
                    onClick={addCustomGenre}
                    disabled={lcInput === ""}
                    className="px-4 py-2.5 rounded-full text-xs border border-violet-500/40 text-violet-300 hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    Add custom genre
                </button>
            </div>
            {(genre.length > 0 || baseSuggestions.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {genre.map((gl) => (
                        <button
                            key={`sel-${gl}`}
                            type="button"
                            onClick={() => setGenre(genre.filter((g2) => g2 !== gl))}
                            className="px-3 py-1 rounded-full text-xs border bg-violet-500/20 border-violet-500/40 text-violet-300"
                        >
                            {baseDisplay.get(gl) ?? gl}
                        </button>
                    ))}
                    {baseSuggestions.map((gl) => (
                        <button
                            key={`sug-${gl}`}
                            type="button"
                            onClick={() => setGenre([...genre, gl])}
                            className="px-3 py-1 rounded-full text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        >
                            {baseDisplay.get(gl) ?? gl}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function ActorsInput({actors, setActors}: {actors: string[], setActors: (actors: string[]) => void}) {
    const [currActor, setCurrActor] = useState<string>("")

    return (
        <div>
            <label htmlFor="actors" className="block text-xs text-gray-400 mb-1.5">Actors / Cast</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={currActor}
                    onChange={(e) => setCurrActor(e.target.value)}
                    id="actors"
                    placeholder="Names, comma-separated"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            const addedActors = currActor.split(",").map((s) => s.trim()).filter(Boolean)
                            if (addedActors.length === 0) return
                            setActors([...actors, ...addedActors])
                            setCurrActor("")
                        }
                    }}
                    className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
                />
                <button
                    type="button"
                    onClick={() => {
                        const addedActors = currActor.split(",").map((s) => s.trim()).filter(Boolean)
                        if (addedActors.length === 0) return
                        setActors([...actors, ...addedActors])
                        setCurrActor("")
                    }}
                    className="px-4 py-2 rounded-full text-sm border border-violet-500 text-violet-400 hover:bg-violet-500/10 transition whitespace-nowrap"
                >
                    Add
                </button>
            </div>
            {actors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {actors.map((a, index) => (
                        <span key={`${index}-${a}`} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-sm text-gray-300">
                            {a}
                            <button
                                type="button"
                                onClick={() => setActors(actors.filter((_, i) => i !== index))}
                                className="text-gray-500 hover:text-white transition leading-none"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
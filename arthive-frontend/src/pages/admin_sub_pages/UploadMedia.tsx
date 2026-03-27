import { useState, useEffect, useRef } from "react"
import { logout } from "../../data/logout"
import { Link, useNavigate } from "react-router-dom"
import type { User } from "../../types/user_types"
import { mediaUpload } from "../../data/media_upload"

const allGenres = ["Drama", "Comedy", "Romance", 
    "Action", "Adventure", "Horror", "Thriller", 
    "Mystery", "Crime", "Science Fiction", "Fantasy", 
    "Animation", "Musical", "Family", "Western", 
    "War", "Historical", "Biographical", 
    "Documentary", "Experimental", "Superhero", 
    "Disaster", "Survival", "Sports", "Spy", 
    "Political", "Road Movie", "Coming of Age", 
    "Slice of Life", "Noir"]
export default function UploadMedia({user, setUser}: {user: User, setUser: (user: User | null) => void}) {
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



    console.log("title: ", title)
    console.log("creator: ", creator)
    console.log("year: ", year)
    console.log("content_type: ", content_type)
    console.log("language: ", language)
    console.log("summary: ", summary)
    console.log("genre: ", genre)
    console.log("ongoing: ", ongoing)
    console.log("actors: ", actors)
    console.log("page_count: ", page_count)
    console.log("series_title: ", series_title)
    console.log("organization: ", organization)
    console.log("cover_image: ", cover_image)
    console.log("File Input Ref: ", fileInputRef.current?.value)
    return (
        <div>
            <h1>Upload Media</h1>
            <Link to="/admin">Back to Admin Panel</Link> 
            
            <form onSubmit={(e) => {
                e.preventDefault()
                mediaUpload({title, creator, year, content_type, language, summary, genre, ongoing, actors, page_count, series_title, organization, cover_image}, setUser, navigate)
            }}>
            <InputField title="Title" type="text" value={title} setter={setTitle} can_be_empty={false}/>
            <InputField title="Creator" type="text" value={creator} setter={setCreator} can_be_empty={false}/>
            <InputField title="Year" type="text" value={year} setter={setYear} can_be_empty={false}/>
            

            <InputField title="Language" type="text" value={language} setter={setLanguage} can_be_empty={false}/>
            <InputField title="Summary" type="textarea" value={summary} setter={setSummary} can_be_empty={false}/>
            
            <ContentTypeRadio content_type={content_type} setContentType={setContentType}/>
            
            <GenreInput genre={genre} setGenre={setGenre}/>

            <div>
                <label htmlFor="ongoing">Ongoing</label>
                <input type="checkbox" id="ongoing" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} />
            </div>
                   
            { content_type != "book" ? <ActorsInput actors={actors} setActors={setActors}/> : <InputField title="Page Count" type="number" value={page_count} setter={setPageCount} can_be_empty={true}/>}

            <InputField title="Series Title" type="text" value={series_title} setter={setSeriesTitle} can_be_empty={true}/>
            <InputField title="Organization" type="text" value={organization} setter={setOrganization} can_be_empty={true}/>

            <div>
                <label htmlFor="cover_image">Cover Image</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} />
                {cover_image ?
                <>
                    <img width={300} height={300} src={cover_image ? URL.createObjectURL(cover_image) : ""} alt="Cover Image" /> 
                    <button onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                            setCoverImage(null)
                            URL.revokeObjectURL(URL.createObjectURL(cover_image))
                        }
                    }}>X</button>
                </>
                : <p>No cover image selected</p>}
                
            </div>


            <button type="submit">Upload</button>
            </form>
        </div>
    )
}

function InputField({title, type, value, setter, can_be_empty}: {title: string, type: string, value: any, setter: any, can_be_empty: boolean}) {
    return (
        <div>
            <label htmlFor={title}>{title}</label>
            <input type={type} id={title.toLowerCase().replaceAll(" ", "_")} value={value || ""} onChange={(e) => {
                if (can_be_empty && e.target.value === "") {
                    setter(null)
                } else {
                    setter(e.target.value)
                }
            }} />
        </div>
    )
}

function ContentTypeRadio({content_type, setContentType}: {content_type: string, setContentType: (content_type: string) => void}) {
    return (
        <div>
                <label htmlFor="content_type">Content Type</label>
                
                
                <label htmlFor="book">Book</label>
                <input checked={content_type === "book"} name="content_type" type="radio" id="book" value="book" onChange={(e) => setContentType(e.target.value)} />
                
                <label htmlFor="film">Film</label>
                <input checked={content_type === "film"} name="content_type" type="radio" id="film" value="film" onChange={(e) => setContentType(e.target.value)} />
                
                <label htmlFor="series">Series</label>
                <input checked={content_type === "series"} name="content_type" type="radio" id="series" value="series" onChange={(e) => setContentType(e.target.value)} />
                
        </div>
        
    )
}

function GenreInput({genre, setGenre}: {genre: string[], setGenre: (genre: string[]) => void}) {
    const [currGenre, setCurrGenre] = useState<string>("")
    return (
        <div>
            <label htmlFor="genre">Genre</label>
            <input type="text" value={currGenre} onChange={(e) => setCurrGenre(e.target.value)} id="genre"/>

            {
                allGenres.map((g) => {
                    const q = currGenre.toLowerCase()
                    const gl = g.toLowerCase()
                    if ((currGenre === "" || !gl.startsWith(q)) && !genre.includes(gl)) {
                        return null
                    }

                    return (
                        <div key={g}>
                            <label htmlFor={g}>{g}</label>
                            <input type="checkbox" id={g} checked={genre.includes(gl)} onChange={(e) => setGenre(e.target.checked ? [...genre, g.toLowerCase()] : genre.filter((g2) => g2 !== g.toLowerCase()))} />
                        </div>
                    )
                })
            }
        </div>
    )
}

function ActorsInput({actors, setActors}: {actors: string[], setActors: (actors: string[]) => void}) {
    const [currActor, setCurrActor] = useState<string>("")

    return (
        <div>
            <label htmlFor="actors">Actors</label>
            <input type="text" value={currActor} onChange={(e) => setCurrActor(e.target.value)} id="actors" placeholder="Enter names, comma-separated" />
            <button
                type="button"
                onClick={() => {
                    const addedActors = currActor.split(",").map((s) => s.trim()).filter(Boolean)
                    if (addedActors.length === 0) return
                    setActors([...actors, ...addedActors])
                    setCurrActor("")
                }}
            >
                Add actors
            </button>

            <p>Added actors</p>
            {actors.map((a, index) => {
                const rowKey = `${index}-${a}`
                return (
                    <div key={rowKey}>
                        <span>{a}</span>{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setActors(actors.filter((_, i) => i !== index))
                            }}
                        >
                            Remove
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
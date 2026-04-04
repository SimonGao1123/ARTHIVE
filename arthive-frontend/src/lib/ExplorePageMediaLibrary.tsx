// displays all the media on explore page
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { EXPLORE_PAGE_MEDIA_QUERY, type ExplorePageMediaResponse, type ExplorePageMediaInput } from "../types/queries/media_request_query"
import { ExplorePageDataFetch } from "../data/explore_page_data"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { MediaCard } from "./MediaCard"
const EXPLORE_MEDIA_LIMIT = 2

export default function ExplorePageMediaLibrary({user, setUser}: {user: User, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const [currContentType, setCurrContentType] = useState<"book" | "film" | "series" | "any">("any")
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string}[]>([])
    
    const [pageNum, setPageNum] = useState<number>(1);
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(true);
    const [ifNextPage, setIfNextPage] = useState<boolean>(true);

    const [getExplorePageMedia, {error, loading}] = useLazyQuery<ExplorePageMediaResponse, ExplorePageMediaInput>(EXPLORE_PAGE_MEDIA_QUERY)
    
    useEffect(() => {
        ExplorePageDataFetch(navigate, setUser, currContentType, EXPLORE_MEDIA_LIMIT, pageNum, setIfPrevPage, setIfNextPage, setAllMedia, getExplorePageMedia)
        if (error) {
            console.log("error in useEffect", error.message)
        }
    }, [currContentType, pageNum])

    return (
        <div>
            <div>
                <button style={{backgroundColor: currContentType === "book" ? "lightgray" : "white"}} onClick={() => setCurrContentType("book")}>Books</button>
                <button style={{backgroundColor: currContentType === "film" ? "lightgray" : "white"}} onClick={() => setCurrContentType("film")}>Films</button>
                <button style={{backgroundColor: currContentType === "series" ? "lightgray" : "white"}} onClick={() => setCurrContentType("series")}>Series</button>
                <button style={{backgroundColor: currContentType === "any" ? "lightgray" : "white"}} onClick={() => setCurrContentType("any")}>All</button>
            </div>
            <p>Page {pageNum}</p>
            <div>{loading ? "Loading..." : <></>}</div>
            <div>
                {error ? error.message : <></>}
            </div>
            {allMedia.map((media) => (
                <MediaCard key={media.id} media={media} prev_page="explore" />
            ))}
            <button onClick={() => setPageNum(pageNum + 1)} disabled={!ifNextPage}>Next</button>
            <button onClick={() => setPageNum(pageNum - 1)} disabled={!ifPrevPage}>Previous</button>
        </div>
    )

}



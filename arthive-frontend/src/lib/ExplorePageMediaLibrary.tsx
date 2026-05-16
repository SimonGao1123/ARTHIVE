// displays all the media on explore page
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { EXPLORE_PAGE_MEDIA_QUERY, type ExplorePageMediaResponse, type ExplorePageMediaInput } from "../types/queries/media_request_query"
import { ExplorePageDataFetch } from "../data/explore_page_data"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { MediaCard } from "./MediaCard"
import ContentFilter from "./ContentFilter"
const EXPLORE_MEDIA_LIMIT = 1

export default function ExplorePageMediaLibrary({user, setUser}: {user: User, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const [currContentType, setCurrContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string}[]>([])
    
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(false);
    const [ifNextPage, setIfNextPage] = useState<boolean>(false);

    const [getExplorePageMedia, {error, loading}] = useLazyQuery<ExplorePageMediaResponse, ExplorePageMediaInput>(EXPLORE_PAGE_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })
    
    const fetchPage = (goNext: boolean, cursor: string | null) => {
        ExplorePageDataFetch(navigate, setUser, currContentType, EXPLORE_MEDIA_LIMIT, setNextCursor, setPrevCursor, cursor, goNext, setIfPrevPage, setIfNextPage, setAllMedia, getExplorePageMedia)
    }

    useEffect(() => {
        fetchPage(true, null)
    }, [currContentType])

    return (
        <div>
            <ContentFilter currContentType={currContentType} setContentType={setCurrContentType} />
            <div>{loading ? "Loading..." : <></>}</div>
            <div>{error ? error.message : <></>}</div>
            {allMedia.map((media) => (
                <MediaCard key={media.id} media={media} />
            ))}
            <button onClick={() => fetchPage(false, prevCursor)} disabled={!ifPrevPage}>Previous</button>
            <button onClick={() => fetchPage(true, nextCursor)} disabled={!ifNextPage}>Next</button>
        </div>
    )

}



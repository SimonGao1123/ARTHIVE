// displays all the media on explore page
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { NEWEST_EXPLORE_PAGE_MEDIA_QUERY, type NewestExplorePageMediaResponse, type NewestExplorePageMediaInput } from "../types/queries/media_request_query.ts"
import { NewestExplorePageDataFetch } from "../data/newest_explore_page_data.ts"
import type { User } from "../types/user_types.ts"
import { useNavigate } from "react-router-dom"
import { MediaCard } from "./MediaCard.tsx"
const EXPLORE_MEDIA_LIMIT = 1

export default function NewestExplorePageMediaLibrary({user, setUser, currContentType}: {user: User, setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all"}) {
    const navigate = useNavigate()
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string}[]>([])
    
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(false);
    const [ifNextPage, setIfNextPage] = useState<boolean>(false);

    const [getNewestExplorePageMedia, {error, loading}] = useLazyQuery<NewestExplorePageMediaResponse, NewestExplorePageMediaInput>(NEWEST_EXPLORE_PAGE_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })
    
    const fetchPage = (goNext: boolean, cursor: string | null) => {
        NewestExplorePageDataFetch(navigate, setUser, currContentType, EXPLORE_MEDIA_LIMIT, setNextCursor, setPrevCursor, cursor, goNext, setIfPrevPage, setIfNextPage, setAllMedia, getNewestExplorePageMedia)
    }

    useEffect(() => {
        fetchPage(true, null)
    }, [currContentType])

    return (
        <div>
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



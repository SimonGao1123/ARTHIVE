import { useNavigate } from "react-router-dom"
import type { User } from "../types/user_types.ts"
import { HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, type HottestExplorePageMediaInput, type HottestExplorePageMediaResponse } from "../types/queries/media_request_query"
import { useLazyQuery } from "@apollo/client/react"
import { useEffect, useState } from "react"
import { hottestExplorePageData } from "../data/hottest_explore_page_data"
import { MediaCard } from "./MediaCard.tsx"

const EXPLORE_MEDIA_LIMIT = 1
export default function HottestExplorePageMediaLibrary({user, setUser, currContentType}: {user: User, setUser: (user: User | null) => void, currContentType: "book" | "film" | "series" | "game" | "all"}) {
    const navigate = useNavigate()

    const [getHottestExplorePageMedia, { error, loading }] = useLazyQuery<HottestExplorePageMediaResponse, HottestExplorePageMediaInput>(HOTTEST_EXPLORE_PAGE_MEDIA_QUERY, {
        fetchPolicy: "no-cache",
    })

    
    const [allMedia, setAllMedia] = useState<{id: number, coverImage: string}[]>([])

    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [prevCursor, setPrevCursor] = useState<string | null>(null)
    const [ifPrevPage, setIfPrevPage] = useState<boolean>(false)
    const [ifNextPage, setIfNextPage] = useState<boolean>(false)

    function fetchPage(goNext: boolean, cursor: string | null) {
        hottestExplorePageData(navigate, setUser, currContentType, EXPLORE_MEDIA_LIMIT, setNextCursor, setPrevCursor, cursor, goNext, setIfPrevPage, setIfNextPage, setAllMedia, getHottestExplorePageMedia)
    }

    useEffect(() => {
        fetchPage(true, null)
    }, [currContentType])
    return (
        <div>
            {loading ? <p>Loading...</p> : <></>}
            {error ? <p>{error.message}</p> : <></>}
            {allMedia.map((media) => (
                <MediaCard key={media.id} media={media} />
            ))}
            <button onClick={() => fetchPage(false, prevCursor)} disabled={!ifPrevPage}>Previous</button>
            <button onClick={() => fetchPage(true, nextCursor)} disabled={!ifNextPage}>Next</button>
        </div>
    )
}

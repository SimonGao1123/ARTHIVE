import { useLazyQuery } from "@apollo/client/react"
import type { Community, ObtainCommunityInput, ObtainCommunityResponse } from "../types/queries/community_request_queries"
import { OBTAIN_COMMUNITY_QUERY } from "../types/queries/community_request_queries"
import type { User } from "../types/user_types"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import type { CommunityThread } from "../types/queries/community_request_queries"
import { obtainCommunityData } from "../data/obtain_community_data"
import { CommunityThreads } from "../lib/CommunityThread"
import { AddThreadComponent } from "../lib/AddThreadComponent"

const LIMIT = 1
export default function CommunityPage({setUser}: {setUser: (user: User | null) => void}) {
    const navigate = useNavigate()
    const { media_id } = useParams()
    if (!media_id) {
        navigate("/")
    }
    const [obtainCommunity, {loading, error}] = useLazyQuery<ObtainCommunityResponse, ObtainCommunityInput>(OBTAIN_COMMUNITY_QUERY)
    const [community, setCommunity] = useState<Community | null>(null)
    const [rootThreads, setRootThreads] = useState<CommunityThread[]>([])

    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string | null>(null)
    const [loadCount, setLoadCount] = useState(0)


    const [ifNextPage, setIfNextPage] = useState(true)

    useEffect(() => {
        obtainCommunityData(media_id!, LIMIT, cursor, query, setCommunity, setRootThreads, setCursor, obtainCommunity, navigate, setUser, setIfNextPage)
    }, [loadCount])

    useEffect(() => {
        if (query) {
            setCursor(null)
            setRootThreads([])
            setLoadCount(prev => prev + 1)
        }
    }, [query])


    return (
        <div>
            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}
            {community && <CommunityDetails community={community}/>}
            
            <p>======================================================</p>
            <AddThreadComponent media_id={media_id ?? ""} setUser={setUser} parentThreadId={null} rootThreadId={null} setThreads={setRootThreads} />
            <p>======================================================</p>
            
            <input type="text" value={currQuery || ""} onChange={(e) => setCurrQuery(e.target.value)} />
            <button onClick={() => setQuery(currQuery || null)}>Search</button>
            {rootThreads && <CommunityThreads threads={rootThreads} setLoadCount={setLoadCount} ifNextPage={ifNextPage} setUser={setUser} navigate={navigate} media_id={media_id ?? ""} />}
        
            
        </div>
    )
}

export function CommunityDetails({community}: {community: Community}) {
    const navigate = useNavigate()
    return (
        <div>
            <h1>Community for {community.media.title}</h1>
            <img onClick={() => navigate(`/media/${community.media.id}`)} src={community.media.coverImage} alt={community.media.title} width={200} height={300}/>
            {community.media.creator && <p>By {community.media.creator}</p>}
            {community.media.year && <p>Year {community.media.year}</p>}
        </div>
    )
}


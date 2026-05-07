import { useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { AllUserListType, ObtainAllUserListsInput, ObtainAllUserListsResponse } from "../types/queries/lists_request_queries"
import { OBTAIN_ALL_USER_LISTS_QUERY } from "../types/queries/lists_request_queries"
import { useLazyQuery } from "@apollo/client/react"
import { obtainAllUserListsData } from "../data/obtain_all_user_lists_data"
import ContentFilter from "../lib/ContentFilter"
import { NumberedPagination } from "../lib/NumberedPagination"
const LIMIT = 2
export default function AllUserListsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    if (!user_id) {
        navigate("/")
        return
    }

    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [pageNum, setPageNum] = useState(1)

    const [lists, setLists] = useState<AllUserListType[]>([])
    const [targetUser, setTargetUser] = useState<User | null>(null)

    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")
    const [totalPages, setTotalPages] = useState<number>(0)

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setLists([])
        setPageNum(1)
        setContentType(nextContentType)
    }

    const [obtainAllUserLists, { loading, error }] = useLazyQuery<ObtainAllUserListsResponse, ObtainAllUserListsInput>(OBTAIN_ALL_USER_LISTS_QUERY)
    useEffect(() => {
        if (!user_id) {
            navigate("/")
            return
        }
        obtainAllUserListsData(user_id, contentType, query, setTotalPages, LIMIT, obtainAllUserLists, setLists, setTargetUser, navigate, setUser, pageNum)
    }, [contentType, pageNum, query])

    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {targetUser && <h1>{targetUser.username}'s Lists</h1>}
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            <input type="text" placeholder="Search" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
            <button disabled={currQuery === query} onClick={() => setQuery(currQuery)}>Search</button>
            {lists && lists.map((list) => {
                return (
                    <ListCard key={list.id} list={list}/>
                )
            })}
            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />
        </div>
    )
}

function ListCard({list}: {list: AllUserListType}) {
    return (
        <div>
            <h2>{list.name}</h2>
            <p>{list.description || "No description"}</p>
            <p>Content Type: {list.contentType.join(", ")}</p>
            <p>{list.ifPrivate ? "Private" : "Public"}</p>
            <p>Tags: {list.tags.join(", ")}</p>
            <p>Created At: {new Date(list.createdAt).toLocaleDateString()}</p>
            <p>Updated At: {new Date(list.updatedAt).toLocaleDateString()}</p>
            
            {
                list.mediaInLists.map((mediaInList) => {
                    return (
                        <div key={mediaInList.media.id}>
                            <img src={mediaInList.media.coverImage || ""} alt={mediaInList.media.id} width={50} height={80}/>
                        </div>
                    )
                })
            }
        <p>============================================</p>
        </div>
    )
}

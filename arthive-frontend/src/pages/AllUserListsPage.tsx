import { useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { AllUserListType, ObtainAllUserListsInput, ObtainAllUserListsResponse } from "../types/queries/lists_request_queries"
import { OBTAIN_ALL_USER_LISTS_QUERY } from "../types/queries/lists_request_queries"
import { useLazyQuery } from "@apollo/client/react"
import { obtainAllUserListsData } from "../data/obtain_all_user_lists_data"
import ContentFilter from "../lib/ContentFilter"
const LIMIT = 2
export default function AllUserListsPage({setUser}: {setUser: (user: User | null) => void}) {
    const { user_id } = useParams()
    const navigate = useNavigate()

    const [contentType, setContentType] = useState<"book" | "film" | "series" | "game" | "all">("all")
    const [pageNum, setPageNum] = useState(1)
    const [ifNextPage, setIfNextPage] = useState(true)

    const [lists, setLists] = useState<AllUserListType[]>([])
    const [targetUser, setTargetUser] = useState<User | null>(null)

    const handleContentTypeChange = (nextContentType: "book" | "film" | "series" | "game" | "all") => {
        if (nextContentType === contentType) {
            return
        }
        setLists([])
        setPageNum(1)
        setIfNextPage(true)
        setContentType(nextContentType)
    }

    const [obtainAllUserLists, { loading, error }] = useLazyQuery<ObtainAllUserListsResponse, ObtainAllUserListsInput>(OBTAIN_ALL_USER_LISTS_QUERY)
    useEffect(() => {
        if (!user_id) {
            navigate("/")
            return
        }
        obtainAllUserListsData(user_id, contentType, pageNum, LIMIT, obtainAllUserLists, setLists, setTargetUser, navigate, setUser, setIfNextPage)
    }, [contentType, pageNum])

    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {targetUser && <h1>{targetUser.username}'s Lists</h1>}
            <ContentFilter currContentType={contentType} setContentType={handleContentTypeChange} />
            {lists && lists.map((list) => {
                return (
                    <ListCard key={list.id} list={list}/>
                )
            })}
            {ifNextPage && <button onClick={() => setPageNum(pageNum + 1)}>Load More</button>}
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
        </div>
    )
}

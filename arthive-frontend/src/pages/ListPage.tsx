import { useEffect, useState } from "react";
import type { User } from "../types/user_types";
import { useNavigate, useParams } from "react-router-dom";
import type { Media } from "../types/media_type";
import type { ListType, ObtainListPageInput, ObtainListPageResponse } from "../types/queries/lists_request_queries";
import { useLazyQuery } from "@apollo/client/react";
import { OBTAIN_LIST_PAGE_QUERY } from "../types/queries/lists_request_queries";
import { obtainListDetails } from "../data/obtain_list_details";
import { NumberedPagination } from "../lib/NumberedPagination";
const LIMIT = 1
export default function ListPage({ setUser}: {setUser: (user: User | null) => void} ) {
    const {list_id} = useParams()
    const navigate = useNavigate()

    if (!list_id) {
        navigate("/")
    }
    const [totalPages, setTotalPages] = useState(0)
    const [mediaInLists, setMediaInLists] = useState<Media[]>([])
    const [listData, setListData] = useState<ListType | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [pageNum, setPageNum] = useState(1)

    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string | null>(null)

    const [obtainListPage, {loading, error}] = useLazyQuery<ObtainListPageResponse, ObtainListPageInput>(OBTAIN_LIST_PAGE_QUERY)
    useEffect(() => {
        obtainListDetails(list_id as string, pageNum, LIMIT, query, setUser, setTotalPages, navigate, obtainListPage, setTargetUser, setListData, setMediaInLists)
    }, [list_id, pageNum, query])


    console.log(listData)
    console.log(targetUser)
    console.log(mediaInLists)
    console.log(totalPages)
    return (
        <div>
            {error && <p>Error: {error.message}</p>}
            {loading && <p>Loading...</p>}
            <h1>{targetUser?.username}'s List - {listData?.name}</h1>
            <p>{listData?.description}</p>
            <p>{listData?.contentType.join(", ")}</p>
            <p>{listData?.tags.join(", ")}</p>
            <p>{listData?.createdAt}</p>
            <p>{listData?.updatedAt}</p>
            <p>{listData?.ifPrivate ? "Private" : "Public"}</p>
            <p>==============================================================</p>

            <input type="text" placeholder="Search" value={currQuery || ""} onChange={(e) => setCurrQuery(e.target.value)} />
            <button onClick={() => setQuery(currQuery || null)}>Search</button>

            {
                mediaInLists.map(
                    (media) => {
                        return <ListMediaCard media_data={media}/>
                    }
                )
            }
            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />

        </div>
    )
}

function ListMediaCard({media_data}: {media_data:{id: number, coverImage: string | null, title: string,}}) {
    const navigate = useNavigate()
    return (
        <div>
            <img onClick={() => navigate(`/media/${media_data.id}`)} src={media_data.coverImage || ""} alt={media_data.title} width={50} height={80} />
            <p>{media_data.title}</p>
            <p>-------------------------------------------------------------</p>
        </div>
    )
}